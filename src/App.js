import React, { Component } from 'react';
import axios from 'axios'
import Graph from './Graph';
import './App.css';
import "../node_modules/react-vis/dist/style.css";


let symbols = []

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      isChecked: false,
      stockInfo: [],
      time_series: 'TIME_SERIES_DAILY',
      stockDates: [],
      symbol: 'MSFT',
      todayInterval: '30min',
      allStocks: [],
      sortedStocks: [0, 0],
      highest: []
    }
    this.changeTime = this.changeTime.bind(this)
    this.addStock = this.addStock.bind(this)
    this.parseTime = this.parseTime.bind(this)
    this.fetchStockInfo = this.fetchStockInfo.bind(this)
    this.addDates = this.addDates.bind(this)
    this.checkClick = this.checkClick.bind(this)
  }

      checkClick() {
      this.setState({ isChecked: !this.state.isChecked });
    }
  

  changeTime(event){
    this.setState({time_series: event.target.value})
  }

  displayTime(){
    if(this.state.time_series === 'TIME_SERIES_DAILY'){
      return 'Over The Last 5 Months'
    } else if(this.state.time_series === 'TIME_SERIES_INTRADAY'){
      return 'Today'
    }
    else if(this.state.time_series === 'TIME_SERIES_WEEKLY'){
      return 'Over The Last Two Years'
    }
    else{
      return 'Over The Last 6 Years'
    }
  }

  parseTime(){
    let splitWords = this.state.time_series.split('_').map(word => word[0] + word.slice(1).toLowerCase())
    let timePeriod = '(' + splitWords[splitWords.length-1] + ')'
    return splitWords.slice(0, splitWords.length-1).join(' ') + " " + timePeriod
  }

  addStock(info){
    console.log('ADD STOCK', info)
    let stocks = this.state.stockInfo
    let allStocks = []
    stocks.push(info)
    this.setState({stockInfo: stocks}) //successfully adds another stock to state
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
      return {
          x: new Date(date), 
          open: stock[date]['1. open'], 
          high: stock[date]['2. high'], 
          low: stock[date]['3. low'], 
          y: stock[date]['4. close'], 
          volume: stock[date]['5. volume']
      }
    })
    return withDates
  }

  fetchStockInfo(){
    return  axios.get(
      `https://www.alphavantage.co/query?function=${this.state.time_series}&symbol=${this.state.symbol}&apikey=DFRIUZR4TEQX0I5B`,
    )
    .then(res => {
      symbols.push(this.state.symbol)
      res.data
      this.addStock(res.data[this.parseTime()])
    })
    .catch(err => console.error("Fetching stock data failed", err))
  }
  
sortValues(){
  let highest = []
  let lowest = []
  this.state.allStocks.forEach(stock=>{
    if(stock.slice().sort((a, b) => a.y-b.y)[stock.length-1].y > highest){
      highest.push(stock.slice().sort((a, b) => a.y-b.y)[stock.length-1].y)
    }
  })
  this.setState({highest: highest})
  this.setState({sortedStocks: [0, highest.slice().sort((a,b)=>b-a)]})
}

  componentDidMount(){
    this.fetchStockInfo()
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
              <h2>{symbol}</h2>
              <h3>Peak: ${this.state.highest[index]}</h3>
              {this.displayTime()}
              <button onClick={() =>this.removeStock(index)}>Remove Stock</button>
            </div>
            )
          }
          <div className='add-stock'>
          <input
          onChange = {event => this.setState({
            symbol: event.target.value
          })}
          name="Company-input" 
          id="search-field"
          required
          placeholder = 'Company Symbol'>
          </input>
          <button onClick={this.fetchStockInfo}>Add Stock</button>
          </div>
        </div>
        </div>
      </div>
    );
  }
}

export default App;
