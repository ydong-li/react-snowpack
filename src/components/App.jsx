import {useState, useEffect} from 'react';

export default function App() {
  // Create the count state.
  const [count, setCount] = useState(0);
  // Update the count (+1 every second).
  useEffect(() => {
    if(count >= 20) {
      return
    }
    const timer = setTimeout(() => {
      console.log({timer});
      setCount(count + 1)
    }, 1000);
    return () => clearTimeout(timer);
  }, [count, setCount]);
  // Return the App component.
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Page has been open for <code>{count}</code> seconds.
        </p>
      </header>
    </div>
  );
}





