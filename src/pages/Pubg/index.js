import React, { Component } from 'react';
import styled from 'styled-components'

import ReplayPubg from "../../components/Replay";
import Telemetry from "../../models/Telemetry"
// import ReplayWorker from "../../models/Replay.worker.js";
import jsonData from '../../assets/Pubg/originalPubg.json'
import DocumentTitle from 'react-document-title'
import parseTelemetry from "../../models/Telemetry.parser";

const Message = styled.p`
    text-align: center;
`


class Pubg extends Component{
    state = {
        rawTelemetry: null,
        telemetry: null,
        telemetryLoaded: false,
        telemetryError: "",
        rosters: null,
        globalState: null,
        match: null
    }


    componentDidMount() {
        this.loadTelemetry();
    }

    loadTelemetry = async () => {
        this.cancelTelemetry();

        console.log(`Loading telemetry for local match for test.`);
        const match = jsonData.match
        const rawReplayData = jsonData.rawTelemetry
        const { state, globalState } = parseTelemetry(match, rawReplayData, "NaLDo627")
        console.log(1, state)
        const telemetry = Telemetry(state)
        this.setState({
            telemetry,
            match,
            telemetryLoaded: true,
            rosters: telemetry.finalRoster("NaLDo627"),
            globalState,
            playerName: "NaLDo627"
        })

        console.log("success")
        // const { match: { params } } = this.props;
        // this.setState({ telemetry: null, telemetryLoaded: false, telemetryError: "" });

        // if(typeof params.matchId === "undefined") {
        //     console.log(`Loading telemetry for local match for test.`);
        //     const match = jsonData.match
        //     const rawReplayData = jsonData.rawTelemetry
        //     const { state, globalState } = parseTelemetry(match, rawReplayData, "NaLDo627")

        //     const telemetry = Telemetry(state)
        //     this.setState({
        //         telemetry,
        //         match,
        //         telemetryLoaded: true,
        //         rosters: telemetry.finalRoster("NaLDo627"),
        //         globalState,
        //         playerName: "NaLDo627"
        //     })

        //     console.log("success")
        //     return;
        // }

       // console.log(`Loading telemetry for match ${params.matchId}`);



        // this.telemetryWorker = new ReplayWorker();

        // this.telemetryWorker.addEventListener('message', ({ data }) => {
        //     const { success, error, state, globalState, match, focusedPlayerName } = data

        //     if (!success) {
        //         console.error(`Error loading telemetry: ${error}`)

        //         this.setState({
        //             telemetryError: error,
        //         })

        //         return
        //     }

        //     const telemetry = Telemetry(state)
        //     this.setState({
        //         telemetry,
        //         match,
        //         telemetryLoaded: true,
        //         rosters: telemetry.finalRoster(params.playerId),
        //         globalState,
        //         playerName: focusedPlayerName
        //     })

        //     console.log(success)
        // })

        // this.telemetryWorker.postMessage({
        //     game: 'pubg',
        //     platform: params.shardId,
        //     matchId: params.matchId,
        //     focusedPlayer: params.playerId,
        // })
    }

    cancelTelemetry = () => {
        if (this.telemetryWorker) {
            this.telemetryWorker.terminate()
            this.telemetryWorker = null
        }
    }

    render() {
        const { match, telemetry, telemetryLoaded, telemetryError, rosters, globalState, playerName } = this.state

        let content

        if (telemetryError === "404 NOT_FOUND") {
            content = <Message>Match not found</Message>
        }
        else if (telemetryError === "403 FORBIDDEN") {
            content = <Message>Current API key is not valid</Message>
        }
        else if (telemetryError.length !== 0) {
            content = <Message>An error occurred :(</Message>
        } else if (!telemetryLoaded) {
            content = <Message>Loading telemetry...</Message>
        } else {
            console.log(match)
            content = <ReplayPubg
                match={match}
                telemetry={telemetry}
                rosters={rosters}
                globalState={globalState}
                playerName={playerName}
            />
        }

        return content;

        // return (
        //     <React.Fragment>
        //         <DocumentTitle title="PUBG Replay UI" />
        //         <div>
        //             PUBG!
        //         </div>
        //     </React.Fragment>
        // )
    }
}

export default Pubg;