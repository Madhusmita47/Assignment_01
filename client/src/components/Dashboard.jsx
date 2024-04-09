
import { useState, useEffect } from "react";
import { Navbar, Nav, Table, Button, Modal, Dropdown, Form } from 'react-bootstrap';
import { PencilSquare, Transparency, Trash, Download } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Doughnut, Line } from "react-chartjs-2";
// import { DNS_Record_Template } from "../DNS_Record_Template.csv";



const Dashboard = () => {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordData, setRecordData] = useState("");
  const [records, setRecords] = useState([]);



  const addRecord = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/dns/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          recordType,
          recordData,
        }),
      });
      const data = await response.json();
      console.log("data", data);
      if (!response.ok) {
        throw new Error(`Failed to add DNS record: ${response.statusText}`);
      }
      setRecords((prevRecords) => [...prevRecords, data.data]);
      // fetchDnsRecords(); 
      setDomain("");
      setRecordType("");
      setRecordData("");
    } catch (error) {
      console.error(error.message);
    }
  };

  const deleteRecord = async (id) => {

    try {
      console.log("id", id)
      await fetch(`http://localhost:3000/dns/record/${id}`, {
        method: "DELETE",
      });
      setRecords((prevRecords) => {
        return prevRecords.filter((record) => record._id !== id);
      });
    } catch (error) {
      console.error(error.message);
    }
  };


  const updateRecord = async (id, field, newValue) => {
    try {
      const response = await fetch(`http://localhost:3000/dns/record/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: newValue,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update DNS record: ${response.statusText}`);
      }
      setRecords(prevRecords => {
        return prevRecords.map(record => {
          if (record._id === id) {
            return { ...record, [field]: newValue };
          }
          return record;
        });
      });
    } catch (error) {
      console.error(error.message);
    }
  }



  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleClose = (data) => {
    if (data === "upload") setShowUploadModal(false);
    if (data === "add") setShowAddModal(false);
  };
  const handleShow = (data) => {
    if (data === "upload") setShowUploadModal(true);
    if (data === "add") setShowAddModal(true);
  };


  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const items = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT', 'DNSSEC'];

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedItem) {
      alert('Please select an item from the record type dropdown.');
      return;
    }
//-------------------------------------------------------------------------------
  const handelUploadfile = async (e) => {
   e.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      console.log("formdata", formData);

      try {
        const data = await fetch(`http://localhost:3000/fileupload`, {
          method: "POST",
          body: formData,
          mode: "cors",
        });

        const result = await data.json();
        console.log("result", result);
       
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    }
}

  };

  const [droppedFile, setDroppedFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    if (csvFile) {
      setDroppedFile(csvFile);
    }
  };

  const handleFiles = (files) => {
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    if (csvFile) {
      setDroppedFile(csvFile);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };


  return (

    <div>

      <Navbar
        variant="dark"
        className="d-flex flex-wrap justify-content-center justify-content-md-between"
        style={{ backgroundColor: '#343a40', position: "sticky", top: 0 }}
      >
        <Navbar.Brand href="/" className="ms-3">
          DNS Record Management
        </Navbar.Brand>

        <Nav className="d-flex gap-3 me-3">
          <Button size="sm" variant="warning"
            style={{ width: '60px', textAlign: "center" }}
            onClick={() => handleShow('upload')}
          >
            Upload
          </Button>

          <Button size="sm" variant="warning"
            style={{ width: '60px', textAlign: "center" }}
            onClick={() => handleShow('add')}
          >
            Add
          </Button>
        </Nav>
      </Navbar>



      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => handleClose('upload')} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '18px' }}>Upload (Bulk DNS Add)</Modal.Title>
        </Modal.Header>

        <form action="">
          <Modal.Body>

            <div className="text-center mb-3 d-flex justify-content-center align-items-center gap-2">
              <span className="fw-bold">
                Download CSV Template
              </span>

              <a href="/DNS_Record_Template.csv" download={"DNS_Record_Template.csv"}
                style={{}}
                className="text-decoration-none btn bg-primary px-2 btn-sm text-white">
                <Download />
              </a>
            </div>


            <div className="d-flex justify-content-center align-items-center mb-4" style={{ margin: "auto", width: "80%" }}>
              <hr className="flex-grow-1" />
              <span className="mx-2">*</span>
              <hr className="flex-grow-1" />
            </div>


            <div className="mb-3" style={{ position: "relative", height: "180px", border: "2px dashed #ced4da" }}>
              <input className="form-control" type="file" id="formFile"
                accept=".csv"
                style={{ position: "absolute", zIndex: 1, height: "100%", opacity: 0, width: "100%", backgroundColor: "transparent" }}
                onDrop={handleDrop}
                onChange={handleFileSelect}
              />

              <div style={{ width: "100%", textAlign: "center", position: "absolute", top: "50%", left: "50%", zIndex: 0, transform: "translate(-50%, -50%)" }}>

                <span>Drag and Drop File or{" "}</span>
                <label htmlFor="formFile" className="form-label">
                  <span className="fw-bold text-primary">Browse</span>
                </label>
                <p style={{ fontSize: "14px" }}>
                  Supported File Types: .CSV
                </p>

                <p style={{ marginTop: "-10px", fontSize: "16px" }} id="browseFileName">
                  {droppedFile ? droppedFile.name : ""}
                </p>
              </div>
            </div>



          </Modal.Body>
          <Modal.Footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button type="button" variant="secondary"
              onClick={() => handleClose('upload')}
              style={{ width: '80px', textAlign: "center" }}>
              Close
            </Button>

            <Button type="submit" variant="warning"
              style={{ width: '80px', textAlign: "center" }}>
              Upload
            </Button>
          </Modal.Footer>
        </form>
      </Modal>


      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => handleClose('add')} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '18px' }}>Add (Single DNS Add)</Modal.Title>
        </Modal.Header>

        <form onSubmit={handleSubmit}>
          <Modal.Body>

            <div>
              <div className="mb-3">
                {/* <label htmlFor="exampleInputEmail1" className="form-label">Domain Address</label> */}
                <input type="url"
                  className="form-control"
                  id="domainAddress"
                  aria-describedby="domainAddress"
                  placeholder="Domain Address"
                  required />
              </div>

              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic"
                  className="mb-3"
                  style={{ width: '100%', display: "flex", justifyContent: "space-between", alignItems: "center", background: '#fff', color: '#212529', borderColor: '#dee2e6' }}>
                  {selectedItem || 'Select an Record Type'}
                </Dropdown.Toggle>

                <Dropdown.Menu style={{ width: '100%' }}>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Search Record Type..."
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <div style={{ width: '100%', height: "200px", overflow: "auto" }}>
                    {filteredItems.map((item, index) => (
                      <Dropdown.Item key={index}
                        onClick={() => handleItemClick(item)}
                      >
                        {item}
                      </Dropdown.Item>
                    ))}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              <div className="mb-3">
                {/* <label htmlFor="exampleInputEmail1" className="form-label">Record Data</label> */}
                <input type="text"
                  className="form-control"
                  id="recordData"
                  aria-describedby="recordData"
                  placeholder="Record Data"
                  required />
              </div>
            </div>



          </Modal.Body>
          <Modal.Footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button type="button" variant="secondary"
              onClick={() => handleClose('add')}
              style={{ width: '80px', textAlign: "center" }}>
              Close
            </Button>

            <Button type="submit" variant="warning"
              style={{ width: '80px', textAlign: "center" }}>
              Add
            </Button>
          </Modal.Footer>
        </form>
      </Modal>



      <div className="d-flex flex-md-row flex-column gap-3 mt-4"
        style={{ width: '95%', margin: 'auto' }}>
        <div className="dataCard revenueCard customerCard">
          <Bar
            data={{
              labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
              datasets: [
                {
                  label: "Revenue",
                  data: [200, 200, 400, 200, 400, 200, 400],
                  backgroundColor: [
                    "#0d6efd", "#ffc107", "#fd7e14", "#0d6efd", "#ffc107", "#fd7e14"
                  ],
                  borderRadius: 5
                }
              ]
            }}
          />
        </div>

        <div className="dataCard revenueCard customerCard">
          <Doughnut
            data={{
              labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
              datasets: [
                {
                  label: "Revenue",
                  data: [200, 200, 400, 200, 400, 200, 400],
                  backgroundColor: [
                    "#0d6efd", "#ffc107", "#fd7e14"
                  ],
                }
              ]
            }}
          />
        </div>
      </div>





      <div className="dataCard mt-3" style={{ width: '95%', margin: 'auto', maxHeight: '600px', overflow: "auto" }}>

        <p className="font-weight-bold text-center text-decoration-underline"
          style={{ fontSize: '18px' }}>
          <strong>DNS Data Table</strong>
        </p>

        <div className="table-responsive custom-scroll">
          <Table className="custom-table" >
            <thead className="thead-dark">
              <tr>
                <th>S.No.</th>
                <th>Domain</th>
                <th>Record Type</th>
                <th>Record Data</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>1</td>
                <td>https://www.linkedin.com/in/madhusmitasahoo123/</td>
                <td>A</td>
                <td>AALu</td>
                <td className="d-flex gap-2">
                  <Button variant="primary">
                    <PencilSquare size={18} />
                  </Button>
                  <Button variant="danger">
                    <Trash size={18} />
                  </Button>
                </td>
              </tr>

              <tr>
                <td>2</td>
                <td>https://www.linkedin.com/in/raj3028/</td>
                <td>MX</td>
                <td>Tomato</td>
                <td className="d-flex gap-2">
                  <Button variant="primary">
                    <PencilSquare size={18} />
                  </Button>
                  <Button variant="danger">
                    <Trash size={18} />
                  </Button>
                </td>
              </tr>

              <tr>
                <td>3</td>
                <td>https://www.linkedin.com/in/raj3028/</td>
                <td>MX</td>
                <td>Tomato</td>
                <td className="d-flex gap-2">
                  <Button variant="primary">
                    <PencilSquare size={18} />
                  </Button>
                  <Button variant="danger">
                    <Trash size={18} />
                  </Button>
                </td>
              </tr>

              <tr>
                <td>4</td>
                <td>https://www.linkedin.com/in/raj3028/</td>
                <td>MX</td>
                <td>Tomato</td>
                <td className="d-flex gap-2">
                  <Button variant="primary">
                    <PencilSquare size={18} />
                  </Button>
                  <Button variant="danger">
                    <Trash size={18} />
                  </Button>
                </td>
              </tr>

            </tbody>
          </Table>
        </div>
      </div>



      <div style={{ marginTop: "100px" }}></div>

      <footer className="footer dark text-md-end text-center">
        <span className="text-white me-3">
          Developed By {" "}
          <a href="https://www.linkedin.com/in/madhusmitasahoo123/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none text-white">
            Madhusmita
          </a>
        </span>
      </footer>

    </div>



  );
}

export default Dashboard
