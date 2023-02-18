const postgres = require('postgres')

const sql = postgres('postgres://postgres:@localhost:5432/izzy') 


const getUser = async (email, password) => {
    const user = await sql`
        select id, first_name, last_name from users 
        where email = ${email}
        and password = ${password}
    `
    return user
}

const createUser = async (firstName, lastName, email, password) => {
    // if user exists, if so resturn user
    const user = await sql`
        select id, first_name, last_name from users 
        where email = ${email}
        and password = ${password}
    `
    if (user.count > 0) {
        return user
    }

    const newUser = await sql`
        insert into users(first_name, last_name, email, password)
        values (${firstName}, ${lastName}, ${email}, ${password})
        returning id, first_name, last_name
    `
    return newUser
}

const addPlant = async (plant, plantName, location, sunLight, userId, imageLoc) => {
    const newPlant = await sql`
        insert into plants(plant_type, plant_name, location, sunlight_intensity, user_id, image_loc)
        values (${plant}, ${plantName}, ${location}, ${sunLight}, ${userId}, ${imageLoc})
    `
}

const getUserPlants = async (userId) => {
    const userPlants = await sql`
        select * from plants
        where user_id = ${userId}
    `
    return userPlants
}



module.exports = { getUser, createUser, addPlant, getUserPlants }