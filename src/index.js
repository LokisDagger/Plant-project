const express = require('express')
const cheerio = require("cheerio")
const fs = require('fs');
const sql = require('./db')

const app = express()
const port = 3000


const readIndex = () => {
    try {
        const data = fs.readFileSync('html/index.html', 'utf8');
        return data
    } catch (err) {
        console.error(err);
    }
}

const readCreateAccount = () => {
    try {
        const data = fs.readFileSync('html/new_account.html', 'utf8');
        return data
    } catch (err) {
        console.error(err);
    }
}

const readAddPlant = () => {
    try {
        const data = fs.readFileSync('html/add_plant.html', 'utf8');
        return data
    } catch (err) {
        console.error(err);
    }
}

const readUserHome = () => {
    try {
        const data = fs.readFileSync('html/user_home.html', 'utf8');
        return data
    } catch (err) {
        console.error(err);
    }
}

const loadUserPlants = async (firstName, userId, $) => {
    const userPlants = await sql.getUserPlants(userId)
    if (userPlants.count > 0) {   
        $('#planttable').append('<tr id="headers"><th> </th><th>Plant</th><th>Plant Name</th><th>Location</th><th>Sun Light</th></tr>')
        for(let i = 0; i < userPlants.length; i++){
            const plantty = userPlants[i].plant_type
            const plantName = userPlants[i].plant_name
            const location = userPlants[i].location
            const sunLight = userPlants[i].sunlight_intensity
            const imageLoc = userPlants[i].image_loc
            $('#planttable').append(`
            <tr>
                <td><img src="/${imageLoc}" style="width:100px;height:100px;" /></td>
                <td>${plantty}</td>
                <td>${plantName}</td>
                <td>${location}</td>
                <td>${sunLight}</td>
            </tr>`)
        }
        $("#addaplant").replaceWith(`<a href="http://localhost:3000/add-plant?userId=${userId}&firstName=${firstName}">add a plant</a>`)
    } else {
        $("#addaplant").replaceWith(`<a href="http://localhost:3000/add-plant?userId=${userId}&firstName=${firstName}">add your first plant</a>`)
    }
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)

})

app.use(express.static('public'))

app.get('/', (req, res) => {
    const index = readIndex()
    // res.send('Hello World!')
    res.send(index)
})

app.get('/check-login', async (req, res) => {
    const email = req.query.email 
    const password = req.query.password
    const user = await sql.getUser(email, password)
    
    if (user.count === 0) {
        // else redirect to create account
        const newAccount = readCreateAccount()
        res.send(newAccount)
    } else {
        // if true redirect to userhome
        const userHome = readUserHome()
        const $ = cheerio.load(userHome)
        await loadUserPlants(user[0].first_name,user[0].id, $)
        $("h1").replaceWith(`<h1>Welcome to Lets Grow ${user[0].first_name}!</h1>`)        
        res.send($.html())
    }
    
})

app.get('/new-account', async (req, res) => {
    // else redirect to create account
    const newAccount = readCreateAccount()
    res.send(newAccount)
})

app.get('/create-new-account', async (req, res) => {
    const firstName = req.query.fname
    const lastName = req.query.lname 
    const email = req.query.email
    const password = req.query.password
    const cpass = req.query.cpass
    if (cpass === password) {
        // create new user and send to user home
        const newUser = await sql.createUser(firstName, lastName, email, password)
        // if good redirect to userhome
        const userHome = readUserHome()
        const $ = cheerio.load(userHome)
        await loadUserPlants(newUser[0].first_name,newUser[0].id, $)
        $("h1").replaceWith(`<h1>Welcome to Lets Grow ${newUser[0].first_name}!</h1>`)
        
        res.send($.html())
    } else {
        // else redirect to create account
        const newAccount = readCreateAccount()
        res.send(newAccount)
    }

})

app.get('/add-plant', async (req, res) => {
    // else redirect to add plant
    const userId = req.query.userId
    const firstName = req.query.firstName
    const addPlant = readAddPlant()
    const $ = cheerio.load(addPlant)
    $("#plantform").prepend(`<input type="hidden" name="firstName" value=${firstName}>`)
    $("#plantform").prepend(`<input type="hidden" name="userId" value=${userId}>`)
    res.send($.html())
})

app.get('/add-new-plant', async (req, res) => {
    const plant = req.query.plant
    const plantName = req.query.plantnm
    const location = req.query.location
    const sunLight = req.query.sun
    const userId = req.query.userId
    const firstName = req.query.firstName
    let imageLoc = ''
    switch(plant) {
        case 'aloe vera':
            imageLoc = 'images/aloevera.jpeg'
            break;
        case 'zebra plant':
            imageLoc = 'images/hawthornia.jpeg'
            break;
        case 'echeveria':
            imageLoc = 'image/echeveria.jpeg'
            break;
        case 'string of pearls':
            imageLoc = 'images/stringpearl.jpeg'
            break;
        case 'string of dolphins':
            imageLoc = 'images/stringdolphin.jpeg'
            break;
        case 'snake plant':
            imageLoc = 'images/snake.jpg'
            break;
        case 'zanzibar gem':
            imageLoc = 'images/aloevera.jpg'
            break;
        case 'jade plant':
            imageLoc = 'images/jade.jpeg'
            break;
        case 'pincussion cactus':
            imageLoc = 'images/pincactus.jpg'
            break;
        case 'hens and chicks':
            imageLoc = 'images/henschicks.jpg'
            break;
        default: 
        imageLoc = ''
    }
    // insert the plant details into the database check
    const addPlant = await sql.addPlant(plant, plantName, location, sunLight, userId, imageLoc)
    // get all plants for this userId
    const userPlants = await sql.getUserPlants(userId)
    // load the user home page with the plant details
    const userHome = readUserHome()
    const $ = cheerio.load(userHome)
    await loadUserPlants(firstName, userId, $)
    // send page back 
    $("h1").replaceWith(`<h1>Welcome to Lets Grow! ${firstName}</h1>`)
    res.send($.html())
})

//things to do 
//resize images-check
//pass the first name around everytime u go back -check
//print a custom message if there are no plant
//add a crap ton of css and pretty-check
//presentation finish!!!!! flo diagram-software engineering process-discuss to do onward-hardest part-what i enjoyed
//create edit button/sign out button
//maybe add alert system

