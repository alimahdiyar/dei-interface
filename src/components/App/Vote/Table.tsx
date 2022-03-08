import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
// import Skeleton from '@material-ui/lab/Skeleton'
import { lighten, makeStyles, withStyles } from '@material-ui/core/styles'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Slider,
  Tooltip,
} from '@material-ui/core'
import Image from 'next/image'
import BigNumber from 'bignumber.js'
import GaugesTest from './GaugesTest.json'

const Wrapper = styled.div`
  /* border-radius: 10px; */
  background: #212b48;
  /* align-items: center; */
  padding: 20px;
  /* height: 40px; */
`

const PrettoSlider = withStyles({
  root: {
    color: '#faa267',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#faa267',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
  },
  rail: {
    height: 8,
  },
})(Slider)

const headCells = [
  { id: 'asset', numeric: false, disablePadding: false, label: 'Asset' },
  {
    id: 'balance',
    numeric: true,
    disablePadding: false,
    label: 'My Stake',
  },
  {
    id: 'liquidity',
    numeric: true,
    disablePadding: false,
    label: 'Total Liquidity',
  },
  {
    id: 'totalVotes',
    numeric: true,
    disablePadding: false,
    label: 'Total Votes',
  },
  {
    id: 'apy',
    numeric: true,
    disablePadding: false,
    label: 'Bribes',
  },
  {
    id: 'myVotes',
    numeric: true,
    disablePadding: false,
    label: 'My Votes',
  },
  {
    id: 'mvp',
    numeric: true,
    disablePadding: false,
    label: 'My Vote %',
  },
]

function EnhancedTableHead({ classes, order, orderBy, onRequestSort }): JSX.Element {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            style={classes.overrideTableHead}
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              <Typography variant="h5" style={classes.headerText}>
                {headCell.label}
              </Typography>
              {orderBy === headCell.id ? (
                <span style={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
}

const useStyles = {
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: '10px',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  inline: {
    display: 'flex',
    alignItems: 'center',
  },
  inlineBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0px',
  },
  icon: {
    marginRight: '12px',
  },
  textSpaced: {
    lineHeight: '1.5',
    fontWeight: '200',
    margin: '0 2.5px',
    fontSize: '12px',
  },
  textSpacedFloat: {
    lineHeight: '1.5',
    fontWeight: '200',
    fontSize: '12px',
    float: 'right',
  },
  cell: {},
  cellSuccess: {
    color: '#4eaf0a',
  },
  cellAddress: {
    cursor: 'pointer',
  },
  aligntRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  skelly: {
    marginBottom: '12px',
    marginTop: '12px',
  },
  skelly1: {
    marginBottom: '12px',
    marginTop: '24px',
  },
  skelly2: {
    margin: '12px 6px',
  },
  tableBottomSkelly: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  assetInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '24px',
    width: '100%',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(128, 128, 128, 0.32)',
    background: 'radial-gradient(circle, rgba(63,94,251,0.7) 0%, rgba(47,128,237,0.7) 48%) rgba(63,94,251,0.7) 100%',
  },
  assetInfoError: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '24px',
    width: '100%',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(128, 128, 128, 0.32)',
    background: '#dc3545',
  },
  infoField: {
    flex: 1,
  },
  flexy: {
    padding: '6px 0px',
  },
  overrideCell: {
    padding: '0px',
  },
  hoverRow: {
    cursor: 'pointer',
  },
  statusLiquid: {
    color: '#dc3545',
  },
  statusWarning: {
    color: '#FF9029',
  },
  statusSafe: {
    color: 'green',
  },
  imgLogo: {
    marginRight: '12px',
  },
  tableContainer: {
    overflowX: 'scroll',
  },
  overrideTableHead: {
    borderBottom: '1px solid rgba(104,108,122,0.2) !important',
  },
  headerText: {
    fontWeight: '200',
    fontSize: '12px',
  },
  tooltipContainer: {
    minWidth: '240px',
    padding: '0px 15px',
  },
  infoIcon: {
    color: '#06D3D7',
    fontSize: '16px',
    float: 'right',
    marginLeft: '10px',
  },
  doubleImages: {
    display: 'flex',
    position: 'relative',
    width: '70px',
    height: '35px',
  },
  img1Logo: {
    position: 'absolute',
    left: '0px',
    top: '0px',
    border: '3px solid rgb(25, 33, 56)',
    borderRadius: '30px',
  },
  img2Logo: {
    position: 'absolute',
    left: '23px',
    zIndex: '1',
    top: '0px',
    border: '3px solid rgb(25, 33, 56)',
    borderRadius: '30px',
  },
  inlineEnd: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
}

export default function EnhancedTable(): JSX.Element {
  const gauges = GaugesTest
  const [defaultVotes, setParentSliderValues] = useState(gauges.map((gauge) => ({ address: gauge.address, value: 0 })))
  const classes = useStyles
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('totalVotes')
  const [sliderValues, setSliderValues] = useState(defaultVotes)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(0)

  useEffect(() => {
    console.log('defaultVotes ', defaultVotes)
    setSliderValues(defaultVotes)
  }, [defaultVotes])

  const onSliderChange = (event, value, asset) => {
    let newSliderValues = [...sliderValues]

    newSliderValues = newSliderValues.map((val) => {
      if (asset?.address === val.address) {
        val.value = value
      }
      return val
    })

    setParentSliderValues(newSliderValues)
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (!gauges) {
    return (
      <div style={classes.root}>
        none
        {/* <Skeleton variant="rect" width={'100%'} height={40} style={classes.skelly1} />
        <Skeleton variant="rect" width={'100%'} height={70} style={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} style={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} style={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} style={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} style={classes.skelly} /> */}
      </div>
    )
  }

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, 100 - page * rowsPerPage)
  const marks = [
    {
      value: -100,
      label: '-100',
    },
    {
      value: 0,
      label: '0',
    },
    {
      value: 100,
      label: '100',
    },
  ]

  return (
    <div>
      <TableContainer>
        <Table aria-labelledby="tableTitle" size={'medium'} aria-label="enhanced table">
          <EnhancedTableHead classes={classes} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
          <TableBody>
            {gauges.map((row, index) => {
              if (!row) {
                return null
              }
              let sliderValue = sliderValues.find((el) => el?.address === row?.address)?.value
              if (sliderValue) {
                sliderValue = Number(sliderValue)
              } else {
                sliderValue = 0
              }
              return (
                <TableRow key={row?.gauge?.address}>
                  <TableCell style={classes.cell}>
                    <div style={classes.inline}>
                      <div style={{ position: 'relative', marginRight: '6px' }}>
                        <div
                          style={{
                            marginRight: '-10px',
                            background: '#000000',
                            display: 'inline-block',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                          }}
                        >
                          <Image
                            src={row && row.token0 && row.token0.logoURI ? row.token0.logoURI : ``}
                            width="37px"
                            height="37px"
                            alt="token0"
                          />
                        </div>

                        <div
                          style={{
                            background: '#000000',
                            display: 'inline-block',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            position: 'relative',
                          }}
                        >
                          <Image
                            src={row && row.token1 && row.token1.logoURI ? row.token1.logoURI : ``}
                            width="37px"
                            height="37px"
                            alt="token0"
                          />
                        </div>
                      </div>
                      <div>
                        <Typography variant="h2" style={classes.textSpaced}>
                          {row?.symbol}
                        </Typography>
                        <Typography variant="h5" style={classes.textSpaced} color="textSecondary">
                          {row?.isStable ? 'Stable Pool' : 'Volatile Pool'}
                        </Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell style={classes.cell} align="right">
                    <div style={classes.inlineEnd}>
                      <Typography variant="h2" style={classes.textSpaced}>
                        {/* 15000 */}
                        {(row.gauge.balance / row.gauge.totalSupply) * row.reserve0}

                        {/* {formatCurrency(
                            BigNumber(row?.gauge?.balance).div(row?.gauge?.totalSupply).times(row?.reserve0)
                          )} */}
                      </Typography>
                      <Typography variant="h5" style={classes.textSpaced} color="textSecondary">
                        {row?.token0?.symbol}
                      </Typography>
                    </div>
                    <div style={classes.inlineEnd}>
                      <Typography variant="h5" style={classes.textSpaced}>
                        {(row.gauge.balance / row.gauge.totalSupply) * row.reserve1}
                        {/* {formatCurrency(
                            BigNumber(row?.gauge?.balance).div(row?.gauge?.totalSupply).times(row?.reserve1)
                          )} */}
                        {/* 1200 */}
                      </Typography>
                      <Typography variant="h5" style={classes.textSpaced} color="textSecondary">
                        {row?.token1?.symbol}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell style={classes.cell} align="right">
                    <div style={classes.inlineEnd}>
                      <Typography variant="h2" style={classes.textSpaced}>
                        {row?.reserve0}
                      </Typography>
                      <Typography variant="h5" style={classes.textSpaced} color="textSecondary">
                        {row?.token0?.symbol}
                      </Typography>
                    </div>
                    <div style={classes.inlineEnd}>
                      <Typography variant="h5" style={classes.textSpaced}>
                        {row?.reserve1}
                      </Typography>
                      <Typography variant="h5" style={classes.textSpaced} color="textSecondary">
                        {row?.token1?.symbol}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell style={classes.cell} align="right">
                    <Typography variant="h2" style={classes.textSpaced}>
                      {row?.gauge?.weight}
                    </Typography>
                    <Typography variant="h5" style={classes.textSpaced} color="textSecondary">
                      {row?.gauge?.weightPercent} %
                    </Typography>
                  </TableCell>
                  <TableCell style={classes.cell} align="right">
                    {row?.gauge?.bribes.map((bribe, idx) => {
                      return (
                        <div key={idx} style={classes.inlineEnd}>
                          <Typography variant="h2" style={classes.textSpaced}>
                            {bribe.rewardAmount}
                          </Typography>
                          <Typography variant="h5" style={classes.textSpaced} color="textSecondary">
                            {bribe.token.symbol}
                          </Typography>
                        </div>
                      )
                    })}
                  </TableCell>
                  <TableCell style={classes.cell} align="right">
                    <Typography variant="h2" style={classes.textSpaced}>
                      {/* {formatCurrency(BigNumber(sliderValue).div(100).times(token?.lockValue))} */}
                      {sliderValue / 100}
                    </Typography>
                    <Typography variant="h5" style={classes.textSpaced} color="textSecondary">
                      {sliderValue} %
                    </Typography>
                  </TableCell>
                  <TableCell style={classes.cell} align="right">
                    <PrettoSlider
                      valueLabelDisplay="auto"
                      value={sliderValue}
                      onChange={(event, value) => {
                        onSliderChange(event, value, row)
                      }}
                      min={-100}
                      max={100}
                      marks
                    />
                  </TableCell>
                </TableRow>
              )
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 61 * emptyRows }}>
                <TableCell colSpan={7} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={gauges.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  )
}
