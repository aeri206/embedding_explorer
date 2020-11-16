import './App.css';
import Explorer from './components/Explorer';

function App() {
  return (
    <div className="App">
      <header/>
      <Explorer
        method="pca"
        dataset="mnist_sampled_10"
        isLabel={true}
      />
      <footer/>
    </div>
  );
}

export default App;
