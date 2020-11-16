import React, { Component } from 'react';


import './App.css';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/Logo/Logo';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import FaceRecognition from './components/face-recognition/FaceRecognition';
import Signin from './components/signin/Signin';
import Register from './components/register/Register';



const particleOptions = {
  particles: {
    number: {
      value: 50,
      density: {
        enable: true,
        value_area: 1000
      }
    }
  },
  interactivity: {
	        events: {
	            onhover: {
	                enable: true,
	                mode: 'repulse'
	            }
	        }
	    }
}

const initialState = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
        user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (boxData) => {
    this.setState({ box: boxData})
  }

  onInputChange = e => {
    this.setState({input: e.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    fetch('https://smart-brain-trebilcode.herokuapp.com/imageurl', {
      method: 'post', 
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response => {
      if(response) {
        fetch('https://smart-brain-trebilcode.herokuapp.com/image', {
          method: 'put', 
          headers: {'Content-type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count}))
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response)) 
    })
    .catch(error => {
      console.log(error.message)
    })
  }

    onRouteChange = route => {
      if(route === 'signout') {
        this.setState(initialState)
      } else if (route === 'home') {
        this.setState({isSignedIn: true})
      }
      this.setState({ route: route })
    }

  render() {
    return (
    <div className="App">
      <Particles
        className='particles' 
        params={particleOptions} />
      <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
      { this.state.route === 'home' 
      ? <div>
          <Logo />
          <Rank userName={this.state.user.name} userEntries={this.state.user.entries} />
          <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onButtonSubmit={this.onButtonSubmit}        
          />
          <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
        </div>
        : (
          this.state.route === 'signin'
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
          
      }
      
    </div>
  );
  }  
}

export default App;
