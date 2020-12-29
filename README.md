Follow the steps to get started:
1) Clone this repo on your system.
2) Write "npm install" to install all the required dependencies

-------------------------------------------------------------------------------------------------------------------------------------
How to use fileDB

1) Create a instance of fileDB. 
    const db = new fileDB();
    
2) Create a datastore by using "db.createDatastore(name,path)" method
  name is required
  path is optional, if not provided it will create the datastore in the datastore folder.
  
3) Call "db.useDatastore(name,path)" method to use(create,read and delete operations) the datastore.

4) To insert a key-value pair in the datastore use "db.insert(key,value,timeToLive)" method
    key and value are required
     timeToLive is optional, if provided then it should be the integer denoting the number of seconds after which we can't read and delete that key from the datastore
     
5) To get the value associated with a key use "db.get(key)" method

6) To delete a key use "db.delete(key)" method
