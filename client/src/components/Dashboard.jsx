
import { useState, useEffect } from "react";
import { Navbar, Nav, Table, Button, Modal, Dropdown, Form, InputGroup, FormControl } from 'react-bootstrap';
import { PencilSquare, Transparency, Trash, Download } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Doughnut, Line } from "react-chartjs-2";
// import { DNS_Record_Template } from "../DNS_Record_Template.csv";
const BaseURl = import.meta.env.VITE_API_KEY;
import { BsSearch, BsX } from 'react-icons/bs';
import { toast } from 'react-toastify';


const toastStyle = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
}

const Dashboard = () => {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordData, setRecordData] = useState("");
  const [records, setRecords] = useState([]);
  const [chatRecord, setChatRecord] = useState({});
  const [chatRecord2, setChatRecord2] = useState({});

  useEffect(() => {
    fetchRecords();
    fetchChat();
  }, []);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditDataModal, setShowEditDataModal] = useState({});
  const [droppedFile, setDroppedFile] = useState(null);

  const handleClose = (data) => {
    if (data === "upload") setShowUploadModal(false);
    if (data === "add") setShowAddModal(false);
    if (data === "edit") {
      setShowEditModal(false);
      setShowEditDataModal({});
    }
  };
  const handleShow = (data) => {
    if (data === "upload") setShowUploadModal(true);
    if (data === "add") setShowAddModal(true);
    if (data === "edit") setShowEditModal(true);
  };


  const [selectedOption, setSelectedOption] = useState("");
  const [search, setSearch] = useState("");

  const handleDropdownSelect = (option) => {
    setSelectedOption(option);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleReset = () => {
    setSelectedOption("");
    setSearch("");
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedOption, search])

  const fetchChat = async () => {
    try {
      const response = await fetch(`${BaseURl}/aggregatedata`);
      const data = await response.json();

      const chat1 = {};
      chat1.labels = Object.values(data.count).map((item) => (
        item['_id']
      ));
      chat1.data = Object.values(data.count).map((item) => (
        parseInt(item['total_count'])
      ));
      setChatRecord(chat1);

      const chat2 = {};
      chat2.labels = Object.values(data.percentage).map((item) => (
        item['_id']
      ));
      chat2.data = Object.values(data.percentage).map((item) => (
        parseFloat(item['percentage'])
      ));

      setChatRecord2(chat2);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };


  const fetchRecords = async () => {
    try {
      const response = await fetch(`${BaseURl}/dns/getallrecords?domain=${search}&recordType=${selectedOption}`);
      const data = await response.json();
      setRecords(data.data);
      fetchChat();

    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };


  const addRecord = async (e) => {
    e.preventDefault();
    try {
      let res = await fetch(`${BaseURl}/dns/record`, {
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

      res = await res.json();

      setDomain("");
      setRecordType("");
      setRecordData("");
      fetchRecords();
      handleClose('add');
      toast(res?.message, toastStyle);
    } catch (error) {
      toast('There was some errors', toastStyle);
    }
  };

  const deleteRecord = async (id) => {

    try {
      let res = await fetch(`${BaseURl}/dns/record/${id}`, {
        method: "DELETE",
      });
      fetchRecords();
      res = await res.json();
      toast(res?.message, toastStyle);
    } catch (error) {
      toast('There was some errors', toastStyle);
    }
  };


  const updateRecord = async (e) => {
    e.preventDefault();
    const id = showEditDataModal['_id'];

    try {
      let res = await fetch(`${BaseURl}/dns/record/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(showEditDataModal),
      });
      res = await res.json();
      fetchRecords();
      handleClose('edit');
      toast(res?.message, toastStyle);
    } catch (error) {
      toast('There was some errors', toastStyle);
    }
  }




  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const items = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT', 'DNSSEC'];

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase())
  );


  const handelUploadfile = async (e) => {
    e.preventDefault();

    if (!droppedFile) {
      alert('Please select valid CSV file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", droppedFile);

      let res = await fetch(`${BaseURl}/fileupload`, {
        method: "POST",
        body: formData,
        mode: "cors",
      });
      res = await res.json();

      fetchRecords();
      handleClose('upload');
      toast(res?.message, toastStyle);
    } catch (error) {
      toast('There was some errors', toastStyle);
    }
  }



  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    if (csvFile) {
      setDroppedFile(csvFile);
    }
  };


  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    if (csvFile) {
      setDroppedFile(csvFile);
    }
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
              onClick={handelUploadfile}
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

        <form onSubmit={addRecord}>
          <Modal.Body>

            <div>
              <div className="mb-3">
                <input type="url"
                  className="form-control"
                  placeholder="Domain Address"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)} />
              </div>

              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic"
                  className="mb-3"
                  style={{ width: '100%', display: "flex", justifyContent: "space-between", alignItems: "center", background: '#fff', color: '#212529', borderColor: '#dee2e6' }}>
                  {recordType === "" ? "Select an Record Type" : selectedItem}
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
                        onClick={() => {
                          handleItemClick(item);
                          setRecordType(item);
                        }}
                      >
                        {item}
                      </Dropdown.Item>
                    ))}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              <div className="mb-3">
                <input type="text"
                  className="form-control"
                  placeholder="Record Data"
                  required
                  value={recordData}
                  onChange={(e) => setRecordData(e.target.value)} />
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


      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => handleClose('edit')} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '18px' }}>Edit (Single DNS Add)</Modal.Title>
        </Modal.Header>

        <form onSubmit={updateRecord}>
          <Modal.Body>

            <div>
              <div className="mb-3">
                <input type="url"
                  className="form-control"
                  placeholder="Domain Address"
                  required
                  value={showEditDataModal?.domain || ""}
                  onChange={(e) => setShowEditDataModal((prev) => ({ ...prev, domain: e.target.value }))} />
              </div>

              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic"
                  className="mb-3"
                  style={{ width: '100%', display: "flex", justifyContent: "space-between", alignItems: "center", background: '#fff', color: '#212529', borderColor: '#dee2e6' }}>
                  {showEditDataModal?.recordType === "" ? "Select an Record Type" : showEditDataModal?.recordType}
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
                        onClick={() => {
                          handleItemClick(item);
                          setShowEditDataModal((prev) => ({ ...prev, recordType: item }))
                        }}
                      >
                        {item}
                      </Dropdown.Item>
                    ))}
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              <div className="mb-3">
                <input type="text"
                  className="form-control"
                  placeholder="Record Data"
                  required
                  value={showEditDataModal?.recordData || ""}
                  onChange={(e) => setShowEditDataModal((prev) => ({ ...prev, recordData: e.target.value }))} />
              </div>
            </div>

          </Modal.Body>
          <Modal.Footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button type="button" variant="secondary"
              onClick={() => handleClose('edit')}
              style={{ width: '80px', textAlign: "center" }}>
              Close
            </Button>

            <Button type="submit" variant="primary"
              style={{ width: '80px', textAlign: "center" }}>
              Edit
            </Button>
          </Modal.Footer>
        </form>
      </Modal>


      <div className="d-flex flex-md-row flex-column gap-3 mt-4"
        style={{ width: '95%', margin: 'auto' }}>
        <div className="dataCard revenueCard customerCard">
          <Bar
            data={{
              labels: chatRecord.labels,
              datasets: [
                {
                  label: "DNS Counts",
                  data: chatRecord.data,
                  backgroundColor: [
                    "#0d6efdd9", "#ffc107de", "#fd7e14d6", "#198754de", "#055160db", "#dc3545de", "#0dcaf0db", "#58151cde", "#6f42c1d6", '#664d03db'
                  ],
                  borderRadius: 5
                },
                {
                  label: "Line Data",
                  data: chatRecord.data,
                  type: 'line',
                  borderColor: '#664d03',
                  fill: false,
                  tension: 0.4,
                  borderWidth: 1.5,
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  cubicInterpolationMode: 'monotone'
                }
              ]
            }}
            options={{
              plugins: {
                legend: {
                  position: 'bottom',
                },
              }
            }}
          />
        </div>

        <div className="dataCard revenueCard customerCard">
          <Doughnut
            data={{
              labels: chatRecord2.labels,
              datasets: [
                {
                  label: "DNS Percentage",
                  data: chatRecord2.data,
                  backgroundColor: [
                    "#0d6efdd9", "#ffc107de", "#fd7e14d6", "#198754de", "#055160db", "#dc3545de", "#0dcaf0db", "#58151cde", "#6f42c1d6", '#664d03db'
                  ],
                }
              ]
            }}
          />
        </div>
      </div>





      <div className="dataCard mt-3" style={{ width: '95%', margin: 'auto' }}>

        <div className="mb-4">
          <p className="font-weight-bold text-center text-decoration-underline"
            style={{ fontSize: '18px' }}>
            <strong>DNS Data Table</strong>
          </p>


          <InputGroup>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" className="rounded-start" style={{ width: "115px", fontSize: "14px" }}>
                {selectedOption || 'Select Type'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleDropdownSelect("")} style={{ fontSize: "12px", fontWeight: "600" }}>None</Dropdown.Item>
                {items.map((item) => (
                  <>
                    <Dropdown.Item onClick={() => handleDropdownSelect(item)} style={{ fontSize: "12px", fontWeight: "600" }}>
                      {item}
                    </Dropdown.Item>
                  </>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <FormControl
              placeholder={"Search Domain..."}
              aria-label={"Search Domain..."}
              value={search}
              onChange={handleSearchChange}
              // onChange={(e)=> setSearch(e.target.value)}
              className="rounded-0"
              style={{ fontSize: "14px" }}
            />
            <Button variant="outline-secondary" className="rounded-0" onClick={handleReset}>
              <BsX />
            </Button>
            <Button variant="outline-secondary" className="rounded-end" style={{ borderLeft: '0' }}>
              <BsSearch />
            </Button>
          </InputGroup>


        </div>

        <div className="table-responsive custom-scroll"
          style={{ maxHeight: '600px', overflow: "auto" }}>

          <Table className="custom-table" >
            <thead className="thead-dark">
              <tr>
                <th>S.No.</th>
                <th>Domain</th>
                <th style={{ minWidth: "110px" }}>Record Type</th>
                <th style={{ minWidth: "110px" }}>Record Data</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {(records && records.length > 0) &&
                <>
                  {records.map((record, index) => (
                    <>
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td title={record.domain} className="custom-line-style">{record.domain}</td>
                        <td style={{ minWidth: "110px" }}>{record.recordType}</td>
                        <td style={{ minWidth: "110px" }} title={record.recordData}>{record.recordData}</td>
                        <td className="d-flex gap-2 ">
                          <Button variant="primary"
                            onClick={() => {
                              setShowEditDataModal(record);
                              handleShow("edit");
                            }}
                          >
                            <PencilSquare size={18} />
                          </Button>
                          <Button variant="danger"
                            onClick={() => deleteRecord(record['_id'])}>
                            <Trash size={18} />
                          </Button>
                        </td>
                      </tr>
                    </>
                  ))}

                </>
              }
            </tbody>
          </Table>

          {(records && records.length === 0) &&
            <p className="mx-auto text-center"
              style={{ fontWeight: "600", width: "100%" }}>
              No DNS Record
            </p>
          }
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
