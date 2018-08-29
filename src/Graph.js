
import React from 'react';
import { curveCatmullRom } from 'd3-shape';
import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  LineSeriesCanvas,
  Crosshair
} from 'react-vis';
import '../node_modules/react-vis/dist/style.css';
import './App.css'

export default class Graph extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      useCanvas: true,
      cursor: [{ x: 0, y: 0 }]
    }
  }

  renderLines() {
    return this.props.allStocks.map((stock, ind) =>
      (
        <LineSeries
          key={ind}
          title='date'
          onNearestX={(value, { index }) => {
            this.setState({ cursor: this.props.allStocks.map(x => x[index]) });
          }}
          data={stock}
        />)
    )
  }
  render() {
    this.props.allStocks[0] ? console.log('PROPS', this.props) : null
    this.props.allStocks[1] ? console.log('PROPS 2', this.props.allStocks[1][0].symbol) : null
    const { useCanvas } = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeries : LineSeriesCanvas;
    let low = 0;
    let high = Number(this.props.sorted[1][0]) + Number(this.props.sorted[1][0] * .4)
    console.log('WIDTH', window.innerWidth)
    return (
      <div className='graph'>
        {this.props.allStocks[0] ?
          <FlexibleWidthXYPlot
          style={{ backgroundColor: '#c2c4c6' }}
            xType="time"
            height={550}
            width={window.innerWidth*.75}
            yDomain={[low, high]}
          >
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis title="Date" tickTotal={12} />
            <YAxis title="Price"
              tickTotal={10}
            />
            {this.renderLines()}
            <Crosshair values={this.state.cursor}>
              <div className='popup'>
                <h1>
                  Date:
                {' ' +
                    Number(new Date(
                      this.state.cursor[
                        this.state.cursor.length - 1
                      ].x
                    ).getMonth() + 1) +
                    "-" +
                    (new Date(
                      this.state.cursor[
                        this.state.cursor.length - 1
                      ].x
                    ).getDate() +
                      "-" +
                      new Date(
                        this.state.cursor[
                          this.state.cursor.length - 1
                        ].x
                      ).getFullYear()
                    ).toString()}
                </h1>
                {this.state.cursor.map(
                  (elem, ind) =>
                    elem === undefined ? (
                      <p key={ind}>No data</p>
                    ) : (
                        <p key={ind}>
                          {this.props.allStocks[ind] === undefined
                            ? "No data"
                            : this.props.symbols[ind] +
                            ": " +
                            "$" +
                            elem.y
                          }
                        </p>
                      )
                )}
              </div>
            </Crosshair>
          </FlexibleWidthXYPlot> : null
        }
      </div>
    );
  }
}

