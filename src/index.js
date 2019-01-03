import React from "react";
import ReactDOM from "react-dom";

import axios from 'axios'

import "./styles.css";

// usually hidden in env but no real options here
const ApiKey = 'aa54164381917c04c87cf9a5d31b0118'

class App extends React.Component {
  state = {cityList:[],
           tempUnit:'F'}
  // add city's weather data do state
  addCity = (cityData) => {
    // default temp from api is kelvin so it needs to be converted before sending to state
    this.convertKelvinToCurrentTempUnit(cityData, this.state.tempUnit)
    this.setState((prevState) => ({cityList:prevState.cityList.concat(cityData)}))
  }

  // changes the state of temp unit in App, it also converts all the currently displayed tiles as well.
  setTempUnit = (tempUnit) => {
    this.setState({ tempUnit: tempUnit }, this.convertAllTemps(this.state.cityList, tempUnit))
    }

  // takes the city list and converts all the temps to the chosen unit
  convertAllTemps = (cityList, tempUnit) => {
    
    // trying to avoid side effects by cloning the city list
    let cityListClone = cityList.slice(0)
    // need to initialize a new array because the citydata objects will also be cloned, 
    // thus breaking their link cityListClone
    let newCityList = []
    if (cityListClone.length == 0) {
      return
    }


    for (let i = 0; i < cityListClone.length; i++) {

        // hacky way to clone an object
      let cityDataJSON = JSON.stringify(cityListClone[i])
      let cityData = JSON.parse(cityDataJSON)

      let tempArray = [cityData.main.temp, cityData.main.temp_max, cityData.main.temp_min]
      for (let j = 0; j < tempArray.length; j++) {
        if(tempUnit == 'C') {
          tempArray[j] = Math.round(this.convertFarenheitToCelcius(tempArray[j]))
        }
        if(tempUnit == 'F') {
          tempArray[j] = Math.round(this.convertCelciusToFarenheit(tempArray[j]))
        }
          
      }
      cityData.main.temp = tempArray[0]
      cityData.main.temp_max = tempArray[1]
      cityData.main.temp_min = tempArray[2]
      newCityList.push(cityData)
    }
 
    this.setState({cityList:newCityList})
  }
  
  // takes api response and converts all temps to chosen unit before rendering
  convertKelvinToCurrentTempUnit (cityData, tempUnit) {
    let tempArray = [cityData.main.temp, cityData.main.temp_max, cityData.main.temp_min]

    // always starts by converting k to c
    for (let i = 0; i < tempArray.length; i++) {
      tempArray[i] = Math.round(this.convertKelvinToCelcius(tempArray[i]))
    }

    if (tempUnit == 'F') {
      for (let i = 0; i < tempArray.length; i++) {
        tempArray[i] = Math.round(this.convertCelciusToFarenheit(tempArray[i]))
      }
    }

    cityData.main.temp = tempArray[0]
    cityData.main.temp_max = tempArray[1]
    cityData.main.temp_min = tempArray[2]
  
  }

  convertKelvinToCelcius (kelvinTemp) {
    return kelvinTemp - 273.15
  } 

  convertCelciusToFarenheit = (cTemp) => {
    return cTemp * 9 / 5 + 32
  }

  convertFarenheitToCelcius = (fTemp) => {
    return (fTemp - 32) * 5 / 9
  }

  render() {
    return(
      <div>
        <Form onSubmit={this.addCity} />
        < TempPicker onChange={this.setTempUnit}/>
        <CityTilePopulate  cities={this.state.cityList} tempUnit={this.state.tempUnit} />
      </div>
    )
  }
}

// gets weather data from openweathermap api and sends it to App
class Form extends React.Component {
  state = {city:''}

  handleSubmit = (event) => {
    event.preventDefault()
    axios
      .get(`https://api.openweathermap.org/data/2.5/weather?q=${this.state.city}&appid=${ApiKey}`)
      .then( response => {this.props.onSubmit(response.data)})
      .catch(function (error) {
        console.log(error)
        alert('Invalid City. Please try again')
      })
    this.setState({ city: '' })
  }
  
  handleChange = event => (this.setState({city:event.target.value}))

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input value={this.state.city} onChange={this.handleChange} placeholder='Enter a city'/>
        <button type='submit'> Add City</button>
      </form>
    )
  }
}

// template for each city tile
const CityTile = (props) => {
  return (
      <div className='cityTile'>
        <img src={"http://openweathermap.org/img/w/" + props.weather[0].icon + ".png"} />
        <div className='cityInfo'>
          <div className='cityName'> {props.name}: </div>
        <div className='cityData'> <strong>Current Temp:</strong> {props.main.temp}º{props.tempUnit}</div>
        <div className='cityData'> <strong>High:</strong> {props.main.temp_max}º{props.tempUnit} <strong>Low:</strong> {props.main.temp_min}º{props.tempUnit} </div> 
        </div>


      </div>

    
  )
}

// populates the screen with all the cites in the list
const CityTilePopulate = (props) => {
  return (
    <div>
      {props.cities.map(city => <CityTile key={city.id} {...city} tempUnit={props.tempUnit}/>)}
    </div>
  )
}


// when radio button is selected TempPicker changes tempUnit state and sends that state back to App
// need to send tempUnit back to App because the addCity function needs to know what the temp unit is for initial rendering
// defaults to F
class TempPicker extends React.Component {
  state = {tempUnit: 'F'}
  
  changeTemp = (changeEvent) => {
    this.setState({tempUnit: changeEvent.target.value},
      this.props.onChange(changeEvent.target.value))
  }
  render () {
    return (
      <form id='tempPicker' onChange={this.changeTemp}>
        <input type='radio' name='temp' value='F' defaultChecked='true' /> F
        <input type='radio' name='temp' value='C' /> C
      </form>
    )
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);


