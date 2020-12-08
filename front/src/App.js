import './App.css';

import BasicInfoTab from './components/Left-BasicInfo';
import ControlTab from './components/Left-Control';
import ExplorerNew from './components/Explorer-new';

function App() {

  const methods = ["pca" , "isomap", "tsne", "umap"];

  return (
    <div className="App">
      <title>Embeding Explorer</title>
      <div className="App-header">
        Distortion in Dimension Reduction
      </div>
      <div id="body">
        <div id="left-bar">
            <BasicInfoTab/>
            <ControlTab/>
        </div>
          <ExplorerNew
            methods={methods}
            method="pca"
            dataset="mnist_sampled_10"
            isLabel={true}
            showMissing={true}
            showFalse={true}
            radius={2.5}
            stroke={3}
          />
      </div>
      <footer/>
    </div>
  );
}

export default App;
