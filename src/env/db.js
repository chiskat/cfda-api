import { MongoClient } from 'mongodb'

let _dbClient = null
let _db = null

export const dbConnect = async () => {
  _dbClient = new MongoClient(process.env.MONGODB_URL)
  await _dbClient.connect()
  _db = _dbClient.db(process.env.MONGODB_DBNAME)
}

export const getDb = () => _db

export default { dbConnect, getDb }
