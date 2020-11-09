const express = require('express')
const app = express()
const cors = require('cors')
const axios = require('axios')

//Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

let fullPkmList = require('./fullPkmList.json')

function ignoreFavicon(req, res, next) {
    if (req.originalUrl.includes('favicon.ico')) {
      res.status(204).end()
    }
    next();
  }

app.get('/api/pokedex', (req, res) => {
    axios.get(`https://pokeapi.co/api/v2/pokemon/?limit=100`)
        .then((list) =>{
            res.json(list.data.results)
        })
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`this is a test ${PORT}`)
})