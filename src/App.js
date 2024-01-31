import './App.css';
import ViewPort    from  './comp/viewPort';
import React, { useRef, useState, useEffect} from 'react';

function Editor() {
  const [viewportRendered, setViewportRendered] = useState(false);

  useEffect(() => {
    setViewportRendered(true);
  }, []);

  return (
    <div id="MainApp" style={{ position:'absolute', display: 'flex', height: '100%', width:'100%', backgroundColor:'purple' }}>
      <ViewPort />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Editor/>
    </div>
  );
}

export default App;