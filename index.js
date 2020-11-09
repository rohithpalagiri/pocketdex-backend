const express = require('express')
const app = express()
const cors = require('cors')
const axios = require('axios')

//Middleware
app.use(cors())
app.use(express.json())

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

let fullPkmList = require('./fullPkmList.json')

app.get('/', (req, res) => {
    axios.get(`https://pokeapi.co/api/v2/pokemon/?limit=100`)
        .then((list) => res.json(list.data.results))
})

app.get('/pokedex/:id', (request, response) => {
    const id = Number(request.params.id)
    const pokemon = fullPkmList[id - 1]

    if (pokemon) {
        axios.all([
            axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`),
            axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        ])
            .then(axios.spread((pokemonResponse, speciesReponse) => {
                let pkmResponse = pokemonResponse.data
                let speciesResponse = speciesReponse.data

                response.json({pkm: pkmResponse, species: speciesResponse })
            }))

    } else {
        response.status(404).end()
    }

})

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})