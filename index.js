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

await db.read()

if (!db.data) db.data = {}
for (let i of ['produits','users',"instances", "magasins"]) {
	if (!db.data.hasOwnProperty(i)) db.data[i] = []
}

const app = express()
app.use(cors())
// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 4000

// CLASSES
class User {
	constructor(name) {
		this.name = name
		this.id = Date.now()
	}
}

class Magasin {
	constructor(params) {
		this._id = Date.now()
		this.name = params.name
		this.adress = params.adress
		this.produits = []
	}
}

class Produit {
	constructor(name) {
		this.id = Date.now()
		this.name = name
		this.instances = []
	}
}

class Instance {
	constructor(params) {
		this._id = Date.now()
		this.name = params.name
		this.category = params.category
		this.price = params.price
		this.quantity = params.quantity
		this.unit = params.unit
		this.magasin = params.magasin
	}
}

function prix_relatif(data){ return `${data.prix / data.quantite} € par ${data.unite}` }

// FUNCTIONS
const DEBUG = (msg) => {
	const debug = true
	debug && console.log("DEBUG => ", msg)
}

async function readAll(res, collection){
		await db.read()
		DEBUG(db.data[collection])
		return res.json(db.data[collection])
}

async function readOne(res, id, collection){
		DEBUG(`Collection:: ${collection}; Item:: ${id}`)
		await db.read()
		const item = db.data[collection].find(x => x.id == id) 
		const message =  `item not found in collection :: ${collection}`
		DEBUG(item ? item : message)
		return res.json(item ? item : message)
}

async function addOne(res, item, collection){
	DEBUG(`Collection:: ${collection}; Item:: ${item.name}`)
	await db.read()

	if (!db.data.hasOwnProperty(collection)) return res.json({ message: "unknown collection" })
	db.data[collection].push(item)

	await db.write()
	return res.json({ success: 'Success !!'})
}

async function addInstance(res, params){
	await db.read()

	let produit = db.data.produits.find(x => x.name == params.category)
	if (!produit) return res.json({message: "no article under this name"})
	let magasin = db.data.magasins.find(x => x._id = params.magasin)
	if (!magasin) return res.json({message: " magasin not found"})

	const instance = new Instance(params)
	instance.magasin = magasin._id
	instance.produit = instance._id 

	db.data.instances.push(instance)
	magasin.produits.push(instance._id)
	produit.instances.push(instance._id)

	await db.write()
	return res.json({message: "success"})
}

// MIDDLEWARES
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => { res.render('index'); });

app.get('/all', (req, res) => { res.json(db.data) })

app.get('/users', (req, res) => { readAll(res, 'users') })
app.get('/user/:id', (req, res) => { readOne(res, req.params.id, "users") })
app.post('/post/user', (Q,S) => { addOne(S, new User(Q.body.name), 'users') })

app.get('/magasins', (req, res) => { readAll(res, 'magasins') })
app.get('/magasin/:id', (req, res) => { readOne(res, req.params.id, "magasins") })
app.post('/post/magasin', (Q,S) => { addOne(S, new Magasin(Q.body), 'magasins') })

app.get('/produits', (req, res) => { readAll(res, 'produits') })
app.get('/produit/:id', (req, res) => { readOne(res, req.params.id, "produits") })
app.post('/post/produit', (Q,S) => {addOne(S, new Produit(Q.body.name), 'produits')})

app.post('/post/instance', (req,res) => { addInstance(res, req.body) })

app.listen(PORT, () => { console.log('Server connected on port ', PORT) })
