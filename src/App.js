import FileReader from './FileReader'
import './App.css';
import img from './sirma.png'

function App() {
  return (
    <div className="App">
      <img className='img' src={img} alt="" />
      <FileReader />
    </div>
  );
}

export default App;
