const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    user: 'kubrabodur',
    host: 'localhost',
    database: 'ligs',
    password: '1q2W3e',
    port: 5432,
});

client.connect();


const jsonData = JSON.parse(fs.readFileSync('superlig.json', 'utf8'));


const insertData = async () => {
    let teamIdMap = {};

    for (const weekData of jsonData) {
        let week = weekData.week;

        for (const match of weekData.matches) {
            let homeTeam = match.homeTeam.name;
            let awayTeam = match.awayTeam.name;
            let [homeScore, awayScore] = match.match.score.split(' - ').map(Number);

          
            if (!teamIdMap[homeTeam]) {
                const res = await client.query('INSERT INTO Teams (name) VALUES ($1) RETURNING id', [homeTeam]);
                teamIdMap[homeTeam] = res.rows[0].id;
            }

         
            if (!teamIdMap[awayTeam]) {
                const res = await client.query('INSERT INTO Teams (name) VALUES ($1) RETURNING id', [awayTeam]);
                teamIdMap[awayTeam] = res.rows[0].id;
            }

            const homeTeam_id = teamIdMap[homeTeam];
            const awayTeam_id = teamIdMap[awayTeam];

         
            await client.query(`
                INSERT INTO Matches (week, homeTeam_id, awayTeam_id, homeScore, awayScore)
                VALUES ($1, $2, $3, $4, $5)
            `, [week, homeTeam_id, awayTeam_id, homeScore, awayScore]);
        }
    }

    await client.end();
    console.log('database added');
};

insertData().catch(err => console.error(err.stack));
