import React from 'react'
import { Container, Sprite } from '@inlet/react-pixi'


class MapSprite extends React.Component {
    state = { image: null }

    render() {
        const mapImage = require(`../../../assets/Pubg/${this.props.mapName}.jpg`);
        return (
            <Container>
                <Sprite image={mapImage} height={this.props.mapSize} width={this.props.mapSize} zIndex={0} />
            </Container>
        )
    }
}

export default MapSprite