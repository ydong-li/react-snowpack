const express = require("express")
const bodyParser = require("body-parser")
const fs = require('fs').promises
import { renderToString } from "react-dom/server"
const snowpackConfig = require('../snowpack.config.js')

const React = require('react')

const { startServer, createConfiguration } = require('snowpack');

(async () => {
  const server = await startServer({ config: createConfiguration(snowpackConfig) });
  const runtime = server.getServerRuntime();

  const app = express();

  app.use(express.static("build"));

  app.use(bodyParser.json());
  //设置跨域访问
  app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", " 3.2.1");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
  });

  app.use(async (req, res, next) => {
    if (/text\/html/.test(req.headers.accept)) {
      try {
        // Server-side import our React component
        // const importedComponent = await runtime.importModule(`/dist${filePath}`);
        // const MyReactComponent = importedComponent.exports.default;
        const filePath = `${process.cwd()}/src${req.url}`
        await autoInject(filePath)
        const Component = await import(filePath)
        await autoInject(filePath, false)
        console.log(Component.default);
        // Render your react component to HTML
        const componetContent = renderToString(<Component.default />);
        // Load contents of index.html
        const htmlContent = await fs.readFile('./public/index.html', 'utf8')
        const document = htmlContent.replace(/<div id="root"><\/div>/, `<div id="root">${componetContent}</div>`);
        res.setHeader('content-type', 'text/html');
        res.end(document)
      } catch (e) {
        res.statusCode = 404;
        next(e)
      }
    }
  })

  app.get("/test", async (req, res) => {
    await wait(1000)
    res.end(JSON.stringify({
      data: { number: 1234 }
    }));
  });

  app.listen(3777);

  async function wait(delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, delay)
    })
  }
})()

async function autoInject(path, add = true) {
  const { jsxInject = '' } = snowpackConfig.buildOptions
  const content = await fs.readFile(path, 'utf-8')
  const result = add ? `${jsxInject}//auto-inject
${content}
` : content.replace(/[\s\S]*?\/\/auto\-inject/, '').trim()
  await fs.writeFile(path, result)
}