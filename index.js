const express = require('express');
const dotenv = require('dotenv');
const path = require("path");
const cors = require('cors');
const bodyParser = require('body-parser');
const Contact = require('./model/Contact')
const {body, validationResult} = require('express-validator');
const Exceljs = require('exceljs');

dotenv.config()

const app = express();
app.use(bodyParser.json())
app.use(cors());
const port = 4000;

app.get('/dashboard',[
    body('name',"Enter Atleast 3 Character").isLength({min:3}),
    body('phone',"Please provide correct phone Number").isLength({min:10,max:10}),
    body('proof',"min 3 words").isLength({min:3}),
    body('business',"provide right credential").isLength({min:3}),
    body('sales',"provide right credential").isLength({min:3})
], async (req,res)=>{
    try {
        // Check Validation if any error
        const errors = validationResult(req) 
        if(!errors.isEmpty){
            return res.status(400).json({errors: errors.array()})
        }

        let contact = new Contact();
        contact.name = req.body.name;
        contact.email = req.body.email;
        contact.phone = req.body.phone;
        contact.proof = req.body.proof;
        contact.business = req.body.business;
        contact.sales = req.body.sales;

        const doc = await contact.save();
        // console.log(doc)
        res.json(doc);
    }
    catch (error) {
        console.error(error.message);
        res.status(401).send("Internal Server Problem");
    }
})


app.delete(`/dashboard/:id`, async(req,res) =>{
    const deleteData = await Contact.findByIdAndDelete(req.params.id)
    res.json(deleteData);
})

app.get('/getData/excel', async (req, res) => {
    try {
      const userData = await Contact.find({});
  
      // Create a new workbook
      const workbook = new Exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Contacts');
  
      // Set headers
      worksheet.addRow(['Name', 'Email', 'Phone', 'Proof', 'Business', 'Sales']);
  
      // Add data to the worksheet
      userData.forEach(contact => {
        worksheet.addRow([
          contact.name,
          contact.email,
          contact.phone,
          contact.proof,
          contact.business,
          contact.sales
        ]);
      });
  
      // Generate the Excel file in memory
      const fileBuffer = await workbook.xlsx.writeBuffer();
  
      // Set the response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'inline; filename=contacts.xlsx');
  
      // Send the Excel file buffer as the response
      res.send(fileBuffer);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error");
    }
  });

app.use(express.static(path.join(__dirname,'./admin/build')))

app.get('*', function(_,res){
    res.sendFile(path.join(__dirname,"./admin/build/index.html")),
    function(err){
        res.status(500).send(err);
    }
})

const server = app.listen(port, function(req,res){
    console.log(`The server running at http://localhost:${port}`)
})