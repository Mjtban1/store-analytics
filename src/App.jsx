import React from 'react';
import Header from './components/Header/Header';
import Layout from './components/Layout/Layout';
import Analytics from './components/Analytics/Analytics';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Header />
      <Layout>
        <Analytics />
      </Layout>
    </div>
  );
};

export default App;