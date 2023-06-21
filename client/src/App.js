import './App.css';
import {BrowserRouter, Route} from 'react-router-dom';
import DevelopmentBanner from './components/DevelopmentBanner';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import DatasetsInfo from './components/DatasetsInfo';
import GseaLookup from './components/GseaLookup';
import MainSuvivalCurve from './components/MainSuvivalCurve';
import MainBoxViolin from './components/MainBoxViolin';
import MainHeatmap from './components/MainHeatmap';
import MainCorrelation from './components/MainCorrelation';
import MainGsea from './components/MainGsea';
import Tutorial from './components/Tutorial';
import About from './components/About';
import routes from './resources/json/routes.json';

function App() {
  return (
    <div className="col-12">
      <BrowserRouter>
        <DevelopmentBanner/>
        <Navbar/>
        <p/>
        <Route path={'(' + routes.client.root + '|' + routes.client.landing + ')'} component={Landing}/>
        <Route path={routes.client.mainSurvival} component={MainSuvivalCurve}/>
        <Route path={routes.client.mainBoxViolin} component={MainBoxViolin}/>
        <Route path={routes.client.mainHeatmap} component={MainHeatmap}/>
        <Route path={routes.client.mainCorrelation} component={MainCorrelation}/>
        <Route path={routes.client.mainGsea} component={MainGsea}/>
        <Route path={routes.client.datasetsInfo} component={DatasetsInfo}/>
        <Route path={routes.client.gseaLookup} component={GseaLookup}/>
        <Route path={routes.client.tutorial} component={Tutorial}/>
        <Route path={routes.client.about} component={About}/>
      </BrowserRouter>
      <div className="spacerLg"/>
    </div>
  );
}

export default App;
