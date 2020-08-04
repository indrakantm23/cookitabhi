const mongoose = require('mongoose');

// mongodb+srv://indrakant:Vishal@123@cookitabhicluster.ppui1.mongodb.net/cookitabhi?retryWrites=true&w=majority

// mongodb://127.0.0.1:27017/cookitabhi
// process.env.MONGODB_URI || 

mongoose.connect('mongodb+srv://indrakant:Vishal@123@cookitabhicluster.ppui1.mongodb.net/cookitabhi?retryWrites=true&w=majority', { useNewUrlParser: true,  useUnifiedTopology: true });
const connection = mongoose.connection;

connection.once('open', ()=> {
    console.log('MongoDB is connected seperately');
}); 

module.exports = connection;