const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
const PORT_NU = 3000
const dbFilePath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null

app.use(express.json())

const initializaDbAndServer = async () => {
  try {
    db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log(
        'Server is listening at https://nitishbfiesnjscpscvyl.drops.nxtwave.tech',
      ),
    )
  } catch (e) {
    console.log('Db Error: ', e.message)
    process.exit(1)
  }
}

initializaDbAndServer()

app.get('/players', async (req, res) => {
  let query = `
    select player_id as playerId, 
    player_name as playerName
    from player_details;`;

  let players = await db.all(query)
  res.send(players)
})

app.get('/players/:playerId', async (req, res) => {
  const {playerId} = req.params
  let query = `
    select player_id as playerId, 
    player_name as playerName
    from player_details where player_id=${playerId};`

  let player = await db.get(query)
  res.send(player)
})

app.put('/players/:playerId', async (req, res) => {
  const {playerId} = req.params
  const {playerName} = req.body

  let query = `
    update player_details
    set player_name="${playerName}"
    where player_id=${playerId};
    `
  await db.run(query)
  res.send('Player Details Updated')
})

app.get('/matches/:matchId', async (req, res) => {
  const {matchId} = req.params
  let query = `
    select match_id as matchId, match, year
    from match_details where match_id=${matchId};`

  let match = await db.get(query)
  res.send(match)
})

app.get('/players/:playerId/matches', async (req, res) => {
    const {playerId} = req.params
    let query = `
    select
    match_details.match_id as matchId,
    match,
    year
    from
    player_details join player_match_score on player_match_score.player_id=player_details.player_id
    join match_details on player_match_score.match_id=match_details.match_id
    where player_details.player_id=${playerId};
    `;
    let allMatchDetails = await db.all(query);
    res.send(allMatchDetails);
})

app.get('/players/:playerId/playerScores', async (req, res) => {
  const {playerId} = req.params
  let query = `
    select
    player_details.player_id as playerId,
    player_name as playerName,
    sum(score) as totalScore,
    sum(fours) as totalFours,
    sum(sixes) as totalSixes
    from
    player_details join player_match_score on player_match_score.player_id=player_details.player_id
    group by player_details.player_id    
    having player_details.player_id=${playerId};
    `;


  let statistics = await db.get(query);
  res.send(statistics);
})
app.get('/matches/:matchId/players', async (req, res) => {
  const {matchId} = req.params;
  let query = `
    select
    player_details.player_id as playerId,
    player_name as playerName
    from
    player_details join player_match_score on player_match_score.player_id=player_details.player_id
    join match_details on player_match_score.match_id=match_details.match_id
    where match_details.match_id=${matchId};
    `;
  let matchDetails = await db.all(query);
  res.send(matchDetails);
})

module.exports=app;