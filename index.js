// IMPORTS
import express from 'express' 
import cors from 'cors'
import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'
import bodyParser from 'body-parser'
import path from 'path'

// CONSTANTS
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

const app = express()
app.use(cors())
// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 4000

// CLASSES
function User(name){
	this.name = name
	this.id = Date.now()
}

// FUNCTIONS
const DEBUG = (msg) => {
	const debug = true
	debug && console.log("DEBUG => ", msg)
}

async function readAll(res, item){
		await db.read()
		DEBUG(db.data[item])
		return res.json(db.data[item])
}

async function readOne(res, id, collection){
		DEBUG(`Collection:: ${collection}; Item:: ${id}`)
		await db.read()
		const item = db.data[collection].find(x => x.id == id) 
		DEBUG(item ? item : `item not found in collection :: ${collection}`)
		return res.json(item ? item : `item not found in collection :: ${collection}`)
}

async function addOne(res, name, collection, Class){
	DEBUG(`Collection:: ${collection}; Item:: ${name}`)
	await db.read()
	const bdd = db.data[collection]
	const already_exist = bdd.find(entity => entity.name == name)
	if (already_exist){
		DEBUG( `There is already an entity in the collection ${collection} with the name ${name}.`)
		return res.json({error: `There is already an entity in the collection ${collection} with the name ${name}.`})
	}
	else DEBUG(`The name ${name} is free`)
	db.data.users.push(new Class(name))
	await db.write()
	return res.json({ success: 'Success !!'})
}

// MIDDLEWARES
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, './index.html'))
})
app.get('/users', (req, res) => {
	readAll(res, 'users')
})

app.get('/mangas', (req, res) => {
	readAll(res, 'mangas')
})


app.get('/user/:id', (req, res) => {
	readOne(res, req.params.id, "users")
})

app.post('/post/user', (req,res) => {
	addOne(res, req.body.name, 'users', User)
})

app.post('/post/data/test', (req,res) => {
	console.log(req.body)
})

app.listen(PORT, () => {
	console.log('Server connected on port ', PORT)
})
