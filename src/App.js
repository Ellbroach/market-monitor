import React, { Component } from 'react';
import axios from 'axios'
import Graph from './Graph';
import './App.css';
import "../node_modules/react-vis/dist/style.css";


let symbols = []

//'Monthly Time Series'
// Time Series (Daily)
// Weekly Time Series

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      stockInfo: [],
      time_series: 'TIME_SERIES_DAILY',
      parse_time_series: '',
      stockDates: [],
      symbol: 'MSFT',
      todayInterval: '5min',
      allStocks: [],
      sortedStocks: [0, 0],
      highest: []
    }
    this.changeTime = this.changeTime.bind(this)
    this.addStock = this.addStock.bind(this)
    this.fetchTodayInfo = this.fetchTodayInfo.bind(this)
    this.parseTime = this.parseTime.bind(this)
    this.fetchStockInfo = this.fetchStockInfo.bind(this)
    this.addDates = this.addDates.bind(this)
    this.parseTimeSeries = this.parseTimeSeries.bind(this)
  }
  

  changeTime(event){
    this.setState({allStocks: []})
    this.setState({sortedStocks: [0, 0]})
    symbols = []
    this.setState({time_series: event.target.value})
  }

  parseTimeSeries(){
    if(this.state.time_series == 'TIME_SERIES_DAILY'){
       return 'Time Series (Daily)'
    }
    else if(this.state.time_series == 'TIME_SERIES_WEEKLY'){
     return 'Weekly Time Series'
    }
    else if(this.state.time_series == 'TIME_SERIES_MONTHLY'){
      return 'Monthly Time Series'
    }
  }

  displayTime(){
    if(this.state.time_series === 'TIME_SERIES_DAILY'){
      return 'Every Market Day'
    } else if(this.state.time_series === 'TIME_SERIES_INTRADAY'){
      return 'Every 5 Minutes'
    }
    else if(this.state.time_series === 'TIME_SERIES_WEEKLY'){
      return 'Every End of the Week'
    }
    else{
      return 'Every End of the Month'
    }
  }

  parseTime(){
    let splitWords = this.state.time_series.split('_').map(word => word[0] + word.slice(1).toLowerCase())
    let timePeriod = '(' + splitWords[splitWords.length-1] + ')'
    return splitWords.slice(0, splitWords.length-1).join(' ') + " " + timePeriod
  }

  addStock(info){
    // console.log('stock dates', this.state.stockDates)
    // console.log('stock info', this.state.stockInfo)
    let stocks = this.state.stockInfo
    let allStocks = []
    let stockDates = []
    stocks.push(info)
    this.setState({stockInfo: stocks}) //successfully adds another stock to state
    this.state.stockInfo.forEach((stock)=>stockDates.push(Object.keys(stock)))
    stockDates.sort((a, b)=>b.length-a.length)
    console.log('STOCK INFO', stockDates)
    this.setState({stockDates: Object.keys(this.state.stockInfo[0])})
    this.state.stockInfo.forEach(selectedStock => 
    allStocks.push(this.addDates(selectedStock))
  )
  this.setState({allStocks: allStocks})
  this.sortValues()
  }

  removeStock(index){
    if(symbols.length == 1 && this.state.allStocks.length === 1){
      symbols = []
      this.setState({allStocks: []})
    }
    else{
    symbols.splice(index, 1)
    let someTest = this.state.allStocks.slice()
    someTest.splice(index, 1)
    this.setState({allStocks: someTest})
    let nextTest = this.state.stockInfo.slice().splice(index, 1)
    this.setState({stockInfo: nextTest})
    this.sortValues()
    }
  }

  addDates(stock){
    let withDates = this.state.stockDates.map((date, ind) => {
      if(stock[date] == undefined){
        return {
          x: new Date(date), 
          open: 0, 
          high: 0, 
          low: 0, 
          y: 0, 
          volume: 0
        }
      } else{
      return {
          x: new Date(date), 
          open: stock[date]['1. open'], 
          high: stock[date]['2. high'], 
          low: stock[date]['3. low'], 
          y: stock[date]['4. close'], 
          volume: stock[date]['5. volume']
      }
    }
    })
    return withDates
  }

  fetchStockInfo(){
    console.log('HERE TEST', this.state.time_series)
    // if(this.state.time_series === 'TIME_SERIES_INTRADAY'){
      // return axios.get(
      //   `https://www.alphavantage.co/query?function=${this.state.time_series}&symbol=${this.state.symbol}&interval=${this.state.todayInterval}&apikey=DFRIUZR4TEQX0I5B`
      // )
    // }
    return  axios.get(
      `https://www.alphavantage.co/query?function=${this.state.time_series}&symbol=${this.state.symbol}&apikey=DFRIUZR4TEQX0I5B`,
    )
    .then(res => {
      console.log('BLARGH', res.data)
      symbols.push(this.state.symbol)
      res.data
      //console.log(this.parseTime())
      //this.addStock(res.data[this.parseTime()])
      this.addStock(res.data[this.parseTimeSeries()])
    })
    .catch(err => console.error("Fetching stock data failed", err))
  }
  
  fetchTodayInfo(){
    console.log('HERE TEST', this.state.time_series)
    return axios.get(
      `https://www.alphavantage.co/query?function=${this.state.time_series}&symbol=${this.state.symbol}&interval=${this.state.todayInterval}&apikey=DFRIUZR4TEQX0I5B`
    )
    .then(res => {
      console.log('NEW BLARGH', res.data)
      symbols.push(this.state.symbol)
      res.data
      //console.log(this.parseTime())
      //this.addStock(res.data[this.parseTime()])
      this.addStock(res.data['Time Series (5min)'])
    })
  }

sortValues(){
  let highest = []
  this.state.allStocks.forEach((stock, index)=>{
    highest[index] = 0
    if(stock.slice().sort((a, b) => a.y-b.y)[stock.length-1].y > highest[index] ){
      highest[index] = (stock.slice().sort((a, b) => a.y-b.y)[stock.length-1].y)
    }
  })
  this.setState({highest: highest})
  this.setState({sortedStocks: [0, highest.slice().sort((a,b)=>b-a)]})
}

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to the Market Monitor</h1>
        </header>
        <div className='graph-inputs'>
        {
          this.state.sortedStocks ? 
        <Graph 
        allStocks={this.state.allStocks}
        sorted={this.state.sortedStocks}
        symbols={symbols}/>
        : null
        }
        <div className='inputs'>
        <div className='time-select'>
        <h3>Select a time frame</h3>
          <select
          onChange={this.changeTime}>
          <option value='TIME_SERIES_DAILY'>Daily</option>
          <option value='TIME_SERIES_INTRADAY'>Today</option>
          <option value='TIME_SERIES_WEEKLY'>Weekly</option>
          <option value='TIME_SERIES_MONTHLY'>Monthly</option>
          </select>
          </div>
          {
            symbols.map((symbol, index)=>
            <div className='symbol-display'>
              <h2>{symbol.toUpperCase()}</h2>
              <h3>Peak: ${this.state.highest[index]}</h3>
              <h3>{this.displayTime()}</h3>
              <button onClick={() =>this.removeStock(index)}>Remove Stock</button>
            </div>
            )
          }
          <div className='add-stock'>
          <input
          onChange = {event => this.setState({
            symbol: event.target.value
          })}
          type='text'
          name="Company-input" 
          id="search-field"
          required
          placeholder = 'Company Symbol'
          // onFocus = "this.placeholder = ''"
          >
          </input>
          {
            this.state.time_series == 'TIME_SERIES_INTRADAY' ? 
            <button className='effect effect-5' onClick={this.fetchTodayInfo}>Add Stock</button> :
            <button className='effect effect-5' onClick={this.fetchStockInfo}>Add Stock</button>
          }
          </div>
        </div>
        </div>
      </div>
    );
  }
}

export default App;
