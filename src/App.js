import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { Label, Container, Row, Col, Input, InputGroup, InputGroupAddon, Button, Spinner, Alert } from 'reactstrap';

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      moveLoading: false,
      query: '',
      error: '',
      moveError: '',
      pokemon: null,
      pokemons: [],
      selectedPokemon: null,
      selectedMove: null,
      moveQuery: ''
    }
  }

  searchPokemon = async (e) => {
    const { query } = this.state
    if (!query) return
    this.setState({ loading: true, error: false })
    try {
      const result = await axios.get(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`)
      const pokemon = result.data

      if (pokemon) {
        this.setState({ pokemon, loading: false })
      }
    }
    catch (error) {
      this.setState({ pokemon: null, error: `${query} ${error.response.data}`, loading: false })
    }
  }

  searchMove = async (e) => {
    const { moveQuery } = this.state
    if (!moveQuery) return
    this.setState({ moveLoading: true, moveError: false })
    try {
      const result = await axios.get(`https://pokeapi.co/api/v2/move/${moveQuery.toLowerCase()}`)
      debugger
      const move = result.data
      if (move) {
        const selectedPokemon = this.state.selectedPokemon
        selectedPokemon.moves.push({ move: { name: move.name } })
        this.setState({ selectedPokemon, moveLoading: false })
      }
    }
    catch (error) {
      this.setState({ moveError: `${moveQuery} ${error.response.data}`, moveLoading: false })
    }
  }

  addPokemon = pokemon => {
    const { pokemons } = this.state
    const existing = pokemons.find(pokemon => pokemon.name === this.state.pokemon.name)
    if (!existing) {
      pokemons.push(pokemon)
      this.setState({ pokemons })
    }
    else {
      this.setState({ error: 'Already Exist in Lineup' })
    }
  }

  selectPokemon = selectedPokemon => {
    this.setState({ selectedPokemon })
  }

  updateMoves = () => {
    const { selectedPokemon, selectedMove, pokemons } = this.state
    const moves = selectedPokemon.moves
    const index = moves.indexOf(selectedMove);
    if (index > -1) {
      moves.splice(index, 1);
    }
    selectedPokemon.moves = moves
    const updatedPokemons = pokemons.map(pokemon=> {
      if (pokemon.name === selectedPokemon.name){
        return selectedPokemon
      }
      else {
        return pokemon
      }
    })
    this.setState({ selectedPokemon, pokemons: updatedPokemons })
    if (moves.length > 0){
      this.setSelectedMove(moves[0].move.name)
    }
  }

  updatePokemon = e => {
    const { selectedPokemon, pokemons } = this.state
    selectedPokemon[e.target.name] = e.target.value
    const updatedPokemons = pokemons.map(pokemon=> {
      if (pokemon.name === selectedPokemon.name){
        return selectedPokemon
      }
      else {
        return pokemon
      }
    })
    this.setState({ selectedPokemon, pokemons: updatedPokemons })
  }

  setSelectedMove = moveName => {
    if (moveName !== '') {
      const selectedMove = this.state.selectedPokemon.moves.find(move => move.move.name === moveName)
      this.setState({ selectedMove })
    }
  }

  render() {
    const { moveLoading, moveError, selectedMove, selectedPokemon, pokemons, pokemon, error, loading } = this.state
    return (
      <Container>
        <Row sm='2'>
          <Col className='pokemon-lineup'>
            <Row style={{marginLeft: 20}}><h3>Pokemon Lineup</h3></Row>
            <Row sm="3">
              {
                pokemons.map(pokemon => {
                  return (
                    <Col className={`pokemon ${selectedPokemon === pokemon ? 'selected' : ''}`} key={pokemon.order}>
                      <img onClick={() => { this.selectPokemon(pokemon) }} alt='pokemon' src={pokemon.sprites.front_default} />
                    </Col>
                  )
                })
              }
            </Row>
          </Col>
          <Col>
            <Row style={{marginLeft: 20}}><h3>Pokedex</h3></Row>
            <InputGroup className='searchbar'>
              <Input onChange={e => { this.setState({ query: e.target.value }) }} />
              <InputGroupAddon addonType="append">
                <Button onClick={this.searchPokemon}>
                  Search
                </Button>
              </InputGroupAddon>
            </InputGroup>
            <div>
              {
                loading && <Spinner color="primary" />
              }
              {
                !loading && pokemon &&
                <div className='pokemon-select'>
                  <img alt='pokemon' onClick={() => this.addPokemon(pokemon)} src={pokemon.sprites.front_default} />
                  <span className='pokemon-name'>{pokemon.name}</span>
                </div>
              }
              {
                error &&
                <Alert className='error-container' color="warning">
                  {error}
                </Alert>
              }
            </div>
          </Col>
          <Col className='pokemon-data'>
            <Row style={{marginLeft: 20}}><h3>Pokemon Data</h3></Row>
            {
              selectedPokemon &&
              <>
                <Row>
                  <Label for="nickname" sm={'2'}>Nickname</Label>
                  <Input placeholder={selectedPokemon.name} name='nickname' onChange={this.updatePokemon} value={selectedPokemon.nickname || ''} />
                </Row>
                <Row>
                  <Label for="favoriteColor" sm={'3'}>Favorite Color</Label>
                  <Input className='favColor' placeholder={'favorite color'} name='favoriteColor' onChange={this.updatePokemon} value={selectedPokemon.favoriteColor || ''} />
                </Row>
                <Row>
                  <Label sm={'3'} for="move">Select Move</Label>
                  <Input id='move' type="select" name="move" onChange={e => this.setSelectedMove(e.target.value)}>
                    <option value="">Choose Move</option>
                    {
                      selectedPokemon.moves.map(move => {
                        return <option value={move.move.name}>{move.move.name}</option>
                      })
                    }
                  </Input>
                  {
                    selectedMove &&
                    <Button className='deleteMove' onClick={() => this.updateMoves()} color='danger'>Delete this Move!</Button>
                  }
                </Row>
                <Row  className='moveSearch'>
                  <InputGroup>
                    <Input onChange={e => { this.setState({ moveQuery: e.target.value }) }} />
                    <InputGroupAddon addonType="append">
                      <Button onClick={this.searchMove}>
                        Add Move
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  <div>
                    {
                      moveLoading && <Spinner color="primary" />
                    }
                    {
                      moveError &&
                      <Alert className='moveError-container' color="warning">
                        {moveError}
                      </Alert>
                    }
                  </div>
                </Row>
              </>
            }
          </Col>
        </Row>
      </Container>
    )
  }
}
