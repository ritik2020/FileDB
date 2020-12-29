const fs = require('fs').promises;
const moment = require('moment');
const sizeof = require('object-sizeof');

class FileDB {
    constructor(){}

    async createDatastore(name,path="./datastore"){
        try {
            if(!name){throw new Error("Name of the database is required")}
            const initialData = JSON.stringify({});
            const location = `${path}/${name}.json`;
            await fs.writeFile(location,initialData);
        } catch(err){
            console.log(err.message);
        }
    }

    useDatastore(name,path){
        try{
            if(!name || !path){throw new Error("All parameters are required")}
            const location = `${path}/${name}.json`;   
            this.dataLocation = location;
        } catch(err){
            console.log(err.message);
        }
        
    }


    async insert(key,value,timeToLive){
        try {
            if(!this.dataLocation){throw new Error("You have to call useDatabase function first")}
            if(!key || !value){throw new Error("Both key and value are required")}
            if(typeof key!='string') {throw new Error("Key should be string only")}
            if(key.length>32){throw new Error("Key length should not be greater than 32 characters")}
            if(typeof value!='object' && value===null) {throw new Error("Value must be object only")}
            if(sizeof(value)>16000){throw new Error("Value size must not be greater than 16kb")}
            if(await this.getFilesizeInBytes(this.dataLocation) >= 1073741824){
                throw new Error("Datastore size must never exceed above 1GB.")
            }
            const res = await fs.readFile(this.dataLocation);
            const data = JSON.parse(res);
            if(!(key in data)){
                data[key] = {}
                data[key]['value'] = value;
                data[key]['createdAt'] = moment().format();
                if(timeToLive){
                    data[key]['timeToLive'] = timeToLive;
                }
                const newData = JSON.stringify(data);
                await fs.writeFile(this.dataLocation,newData);
            }
            else {
                throw new Error("Key already present");
            }
            
        } catch(err) {
            console.log(err.message);
        }
    }

    async get(key){
        try {
            if(!this.dataLocation){throw new Error("You have to call useDatabase function first")}
            if(!key){throw new Error("Key is required")}
            const res = await fs.readFile(this.dataLocation);
            const data = JSON.parse(res);
            if(key in data){
                if(data[key]['timeToLive']!=undefined && this.IsExpired(data[key])){
                    throw new Error("Time to live has expired");
                }
                else {
                    return data[key]['value'];
                }
                
            }
            else{
                throw new Error ("This key is not present in the database");
            }
        } catch(err){
            console.log(err.message);
        }
    }

    async delete(key){
        try{
            if(!this.dataLocation){throw new Error("You have to call useDatabase function first")}
            if(!key){throw new Error("Key is required")}
            const res = await fs.readFile(this.dataLocation);
            const data = JSON.parse(res);
            if(key in data){
                if(data[key]['timeToLive']!=undefined && this.IsExpired(data[key])){
                    throw new Error("Time to live has expired");
                }
                else {
                    delete data[key];
                    const newData = JSON.stringify(data);
                    await fs.writeFile(this.dataLocation,newData);
                }    
            }
            else {
                throw new Error("Key is not present in the database");
            }
        } catch(err){
            console.log(err.message);
        }
    }

    IsExpired(keyData){
        const {createdAt, timeToLive} = keyData;
        const currentDateTime = moment(); 
        const timeDifferenceInSeconds = currentDateTime.diff(createdAt,'seconds');
        if(timeDifferenceInSeconds>timeToLive){
            return true;
        }
        return false;
    }

    async getFilesizeInBytes(filePath) {
        var stats = await fs.stat(filePath);
        var fileSizeInBytes = stats.size;
        return fileSizeInBytes;
    }
}

module.exports = FileDB;