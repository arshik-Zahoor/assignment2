const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const {writeFile, readFile} = require('fs');
const {validation} = require('./validate');
const Joi = require('joi');
const verifyToken = require('./verifyToken');

// static assets
//app.use(express.static('./public'))
// parse form data
app.use(express.urlencoded({extended: false}))

//parse json
app.use(express.json());





//Get all the registered students
app.get('/api/student', (req,res) => {
    readFile('info.json', 'utf8', (err,data) => {
        if(err) throw err;
        const loadData = JSON.parse(data);
        if(!loadData) return res.status(400).json({success:false, msg: 'Data not available'});
        res.status(201).json({success:true, Data: loadData})
        })
 })


// student registration
app.post('/api/student', (req,res) =>{
    const obj = {course,Name,id,email,password} = req.body;
    if(!obj){
        return res.status(401).json({success: false, msg: 'Please provide details'})
    }
    const {error,value} = validation(obj);
    if(error) return res.status(400).send(error.details[0].message);
    readFile('info.json', 'utf8', (err,data) => {
        if(err) throw err;
        const loadData = JSON.parse(data);
        loadData.push(obj);
        console.log(loadData);
        writeFile('info.json', JSON.stringify(loadData), (err) => {
            if(err) throw err;
              console.log('data saved');
              })
    
    });
    res.status(201).json({success: true, obj})

})

//update student details 
app.put('/api/student/:ID',(req,res) => {
    
    const {ID} = req.params;
    let {course,Name,id,email,password} = req.body;
    readFile('info.json', 'utf8', (err,data) => {
        if(err) throw err;
        const loadData = JSON.parse(data);
        const student = loadData.find(student => student.id === Number(ID));
        if(!student) {
            return res.status(404).send(`no student with id : ${ID}`)
        }
    const {error,value} = validation(req.body);
    if(error) return res.status(400).send(error.details[0].message)
    const newStudent = loadData.map((student) => {
        if(student.id === Number(ID)){
        student.course = course;
        student.Name = Name;
        student.email = email;
        student.password = password;
        }
       return student;
        })
        writeFile('info.json', JSON.stringify(newStudent), (err) => {
            if(err) throw err;
              console.log('data saved');
              })
    
        res.status(201).send(`Details of student with id: ${ID} updated successfully`);

    })
    
    
})

// delete student from records
app.delete('/api/student/:ID', (req,res) => {
    const {ID} = req.params;
    readFile('info.json', 'utf8', (err,data) => {
        if(err) throw err;
        const loadData = JSON.parse(data);
        const student = loadData.find(student => student.id === Number(ID));
        if(!student) {
            return res.status(404).send(`no student with id : ${ID}`)
        }
        const newStudent = loadData.filter((student) => student.id !== Number(ID));

        writeFile('info.json', JSON.stringify(newStudent), (err) => {
            if(err) throw err;
              console.log('data saved');
              })

    })
    res.status(201).send(`Details of student with id: ${ID} deleted successfully`);
})

// get specific student's details by id
app.get('/api/student/:ID', verifyToken, (req,res) => {
    const {ID} = req.params;
    readFile('info.json', 'utf8', (err,data) => {
        if(err) throw err;
        const loadData = JSON.parse(data);
        const student = loadData.find(s => s.id === Number(ID));
        if(!student){
            return res.status(400).send(`No student with id: ${ID}`)
        }
        jwt.verify(req.token, 'secretkey', (err, authData)=> {
            if(err) return res.sendStatus(403);
            else {
                res.status(201).json({authData});
            }
        })
    //res.status(201).send(student);
     
    })

})

// get all student's details registered for specified course
app.get('/api/student/course/:course', (req,res) => {

    const {course} = req.params;
    readFile('info.json', 'utf8', (err,data) => {
        if(err) throw err;
        const loadData = JSON.parse(data);
        const regCourse = loadData.find(c => c.course === course);
        if(!regCourse) return res.status(400).send(`No student registered for course : ${course}`)
        const newCourse = loadData.filter((x) => x.course === course);
              
       res.status(201).send(newCourse);
    
})
})

// log in student
app.post('/api/student/login', (req,res) => {
    const {id, password} = req.body;
    if(!req.body){
        return res.status(401).json({success: false, msg: 'Please provide required details to login'})
    }
    readFile('info.json', 'utf8', (err,data) => {
        if(err) throw err;
        const loadData = JSON.parse(data);
        const student = loadData.find(s => s.id === Number(id));
        if(!student){
            return res.status(400).send(`There is no student with id: ${id}, Please register first`)
        }
        if(student.password !== password){
            return res.status(401).send('Incorrect password, Try again')
        }
        jwt.sign({student}, 'secretkey', (err, token) => {
            res.status(201).json({message :`Welcome ${student.Name}`,token});
        })
        
    })
    
})



app.listen(5000, () => {
    console.log('Server is listening on port 5000...');
})