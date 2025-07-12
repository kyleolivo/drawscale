import { Excalidraw } from "@excalidraw/excalidraw";
import './App.css';

function App(): JSX.Element {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DrawScale</h1>
        <p>System Design Interview Prep Tool</p>
      </header>
      <div className="excalidraw-wrapper">
        <Excalidraw />
      </div>
    </div>
  );
}

export default App;