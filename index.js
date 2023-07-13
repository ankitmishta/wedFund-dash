const express = require('express');
const dotenv = require('dotenv');
const path = require("path");
const cors = require('cors');
const connectToMongo = require('./config/db');
const bodyParser = require('body-parser');
const Contact = require('./model/Contact')
const {body, validationResult} = require('express-validator');
const Exceljs = require('exceljs');

dotenv.config()
connectToMongo();

const app = express();
app.use(bodyParser.json())
app.use(cors());
const port = 4000;

app.get('/dashboard', async (req,res) =>{
  const docs = await Contact.find({});
  res.json(docs)
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

app.use(express.static(path.join(__dirname,'./admin/build')));

app.post('*', function(_,res){
    res.sendFile(
        path.join(__dirname,"./admin/build/index.html"),
        function(err){
            res.status(500).send(err);
        }
    );
});

const server = app.listen(port, function(req,res){
    console.log(`The server running at http://localhost:${port}`)
})