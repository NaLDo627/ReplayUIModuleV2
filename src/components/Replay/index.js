import React from 'react'
import { xor, union, difference, merge, cloneDeep, set } from 'lodash'
import styled from 'styled-components'
import * as Options from './Options.js'
import Map from './Map/index.js'
import Roster from './Roster/index.js'
// import TimeTracker from './Time/TimeTracker.js'
import TimeTrackerContainer from '../../containers/TimeTrackerContainer'
import TimeSlider from './Time/TimeSlider.js'
import SpeedControl from './Time/SpeedControl.js'
import MatchInfo from './MatchInfo.js'
import KillFeed from "./KillFeed";
import PlayControls from "./Time/PlayControls";
import MapOptions from "./MapOptions";

// -----------------------------------------------------------------------------
// Styled Components -----------------------------------------------------------
// -----------------------------------------------------------------------------

const MatchContainer = styled.div`
    display: grid;
    grid-template-columns: 180px auto 180px;
    grid-column-gap: 10px;
    border: 0px solid #eee;
    overflow: visible;
    margin: 0 auto;
    max-width: calc(120vh + 90px);
    margin-top:40px;
`

const MapContainer = styled.div`
    grid-column: 2;
    position: relative;
    cursor: ${props => props.isDotHovered ? 'pointer' : 'normal'};
    display: grid;
    background-color:grey;
`

const RosterContainer = styled.div`
    grid-column: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    height: ${props => props.mapSize + 48}px;
    background-color:blue;
`

const KillFeedAndMapOptionContainer = styled.div`
    grid-column: 3;
  
    height: ${props => props.mapSize + 48}px;
    grid-template-rows: ${props => props.mapSize + 48 - 100}px 100px;
    padding-right: 10px;
    background-color:yellow;
`

const KillFeedContainer = styled.div`
    overflow-y: scroll;
    overflow-x: hidden;
    height: ${props => props.mapSize + 48 - 100}px;
    grid-row: 1
    background-color:orange;
`

const MapOptionContainer = styled.div`
    display: grid;
    grid-row: 2
    height: 100px;
`

const MatchHeader = styled.div`
    margin: 0 20px 10px 20px;
`

const ControllerContainer = styled.div`
    display: grid;
    grid-template-columns: 100px 1fr max-content;
       grid-column-gap: 10px;
    margin: 10px 10px 0px 10px;
`

const RosterHeader = styled.div`
    text-align: center;
    font-size: 1.7rem;
    font-weight: 700;
    font-family:"나눔스퀘어";
    margin:10px 0;
`

const KillFeedHeader = styled.div`
    text-align: center;
    font-size: 2.7rem;
    font-weight: 700;
    font-family:"나눔스퀘어";
`

class MatchPlayer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            mapSize: 0,
            focusedPlayer: props.playerName,
            // See getDerivedStateFromProps
            prevPlayerName: props.playerName,
            hoveredPlayer: null,
            trackedPlayers: [],
            options: Options.DEFAULT_OPTIONS,
            setOption: null,
        }
    }

    marks = {
        focusedPlayer: () => this.state.focusedPlayer,
        isPlayerFocused: playerName => this.state.focusedPlayer === playerName,

        hoveredPlayer: () => this.state.hoveredPlayer,
        isPlayerHovered: playerName => this.state.hoveredPlayer === playerName,
        setHoveredPlayer: playerName => this.setState({ hoveredPlayer: playerName }),

        trackedPlayers: () => this.state.trackedPlayers,
        isPlayerTracked: playerName => this.state.trackedPlayers.includes(playerName),
        toggleTrackedPlayer: (...playerNames) => {
            this.setState(({ trackedPlayers }) => {
                if (playerNames.length > 1 && difference(playerNames, trackedPlayers).length !== 0) {
                    return {
                        trackedPlayers: union(trackedPlayers, playerNames),
                    }
                }

                return {
                    trackedPlayers: xor(trackedPlayers, playerNames),
                }
            })
        },
    }

    // -------------------------------------------------------------------------
    // Map Sizing, Lifecycle ---------------------------------------------------
    // -------------------------------------------------------------------------

    // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
    // HACK-ish. Should probably turn this into a controlled component.
    // The functionality isn't needed right now, but I'd rather not break it.
    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.prevPlayerName !== nextProps.playerName) {
            return {
                focusedPlayer: nextProps.playerName,
                prevPlayerName: nextProps.playerName,
            }
        }

        return null
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateMapSize.bind(this))
        this.updateMapSize()
        this.loadOptions()
    }

    componentDidUpdate(prevProps, prevState) {
        this.updateMapSize()
    }

    setOption = (key, val) => {
        this.setState(prevState => {
            const newOptions = cloneDeep(prevState.options)
            set(newOptions, key, val)
            localStorage.setItem(Options.STORAGE_KEY, JSON.stringify(newOptions))
            return { options: newOptions }
        })
    }

    loadOptions = () => {
        const localOptions = JSON.parse(localStorage.getItem(Options.STORAGE_KEY) || '{}')
        const options = merge(Options.DEFAULT_OPTIONS, localOptions)

        this.setState({ options, setOption: this.setOption })
    }

    updateMapSize = () => {
        const stageWrapper = document.getElementById('StageWrapper')

        if (stageWrapper) {
            this.setState(ps => {
                if (ps.mapSize !== stageWrapper.clientWidth) {
                    return { mapSize: stageWrapper.clientWidth }
                }

                return null
            })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateMapSize.bind(this))
    }

    // -------------------------------------------------------------------------
    // Render ------------------------------------------------------------------
    // -------------------------------------------------------------------------

    render() {
        const { match, telemetry, rosters, globalState } = this.props
        const { mapSize, options, setOption, prevPlayerName } = this.state

        return (
            <Options.Context.Provider value={{ options, setOption }}>
                <TimeTrackerContainer
                    options={options}
                    durationSeconds={match.durationSeconds + 5}
                    replayData={telemetry}
                    render={({ msSinceEpoch, timeControls, currentReplayData }) =>
                        <MatchContainer id="MatchContainer">
                            <RosterContainer mapSize={mapSize}>
                                <RosterHeader>이름 / 킬수 / 데미지</RosterHeader>
                                <Roster
                                    match={match}
                                    telemetry={currentReplayData}
                                    rosters={rosters}
                                    marks={this.marks}
                                />
                            </RosterContainer>
                            <MapContainer id="MapContainer" isDotHovered={!!this.marks.hoveredPlayer()}>
                                <MatchHeader>
                                    <MatchInfo
                                        match={match}
                                        marks={this.marks}
                                        playerName={prevPlayerName}
                                    />
                                </MatchHeader>
                                <Map
                                    match={match}
                                    telemetry={currentReplayData}
                                    mapSize={mapSize}
                                    marks={this.marks}
                                    msSinceEpoch={msSinceEpoch}
                                    options={options}
                                />
                                <ControllerContainer>
                                    <PlayControls
                                        autoplay={timeControls.autoplay}
                                        toggleAutoplay={timeControls.toggleAutoplay}
                                        isFinished={(match.durationSeconds + 5) === (msSinceEpoch / 1000)}
                                        rewindToStart={timeControls.rewindToStart}
                                        skip30sForward={timeControls.skip30sForward}
                                        skip30sReverse={timeControls.skip30sReverse}
                                    />
                                    <TimeSlider
                                        value={msSinceEpoch}
                                        stopAutoplay={timeControls.stopAutoplay}
                                        onChange={timeControls.setMsSinceEpoch}
                                        durationSeconds={match.durationSeconds + 5}
                                        globalState={globalState}
                                        skipTo={timeControls.skipTo}
                                    />
                                    <SpeedControl
                                        autoplay={timeControls.autoplay}
                                        autoplaySpeed={timeControls.autoplaySpeed}
                                        toggleAutoplay={timeControls.toggleAutoplay}
                                        changeSpeed={timeControls.setAutoplaySpeed}
                                        isFinished={(match.durationSeconds + 5) === (msSinceEpoch / 1000)}
                                        rewindToStart={timeControls.rewindToStart}
                                    />
                                </ControllerContainer>
                            </MapContainer>
                            <KillFeedAndMapOptionContainer mapSize={mapSize}>
                                <KillFeedContainer mapSize={mapSize}>

                                    <KillFeedHeader>킬 피드</KillFeedHeader>
                                    {currentReplayData && <KillFeed focusPlayer={this.marks.focusedPlayer()}
                                                                   teammates={currentReplayData.players[this.marks.focusedPlayer()].teammates}
                                                                   mapSize={mapSize}
                                                                   killLogs={currentReplayData.killLogs}
                                                                   options={options}
                                                                   skipTo={timeControls.skipTo}
                                                                   stopAutoplay={timeControls.stopAutoplay}
                                                                   msSinceEpoch={msSinceEpoch}
                                    />}
                                </KillFeedContainer>
                                <MapOptionContainer>
                                    <MapOptions options={options} setOption={setOption} />
                                </MapOptionContainer>
                            </KillFeedAndMapOptionContainer>

                        </MatchContainer>
                    }
                />
            </Options.Context.Provider>
        )
    }
}

export default MatchPlayer
