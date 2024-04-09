
import { useState, useEffect } from "react";
import { Navbar, Nav, Table, Button } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import Chart from 'chart.js/auto';



const Dashboard = () => {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordData, setRecordData] = useState("");
  const [records, setRecords] = useState([]);




  // const fetchDnsRecords = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:3000/dns/records/${domain}`);

  //     const data = await response.json();
  //        setRecords(data.data);

  //   } catch (error) {
  //     console.error(error.message);
  //   }
  // };

  // useEffect(() => {
  //   fetchDnsRecords();
  // }, [domain]);

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


  useEffect(() => {
    const data = [
      { year: 2010, count: 10 },
      { year: 2011, count: 20 },
      { year: 2012, count: 15 },
      { year: 2013, count: 25 },
      { year: 2014, count: 22 },
      { year: 2015, count: 30 },
      { year: 2016, count: 22 },
    ];

    const chartConfig = {
      type: 'pie',
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map(row => row.count),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      }
    };

    const ctx = document.getElementById('acquisitions');

    if (ctx) {
      new Chart(ctx, chartConfig);
    }
  }, []);


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
          <Button size="sm" variant="warning" style={{ width: '60px', textAlign: "center" }}>
            Upload
          </Button>

          <Button size="sm" variant="warning" style={{ width: '60px', textAlign: "center" }}>
            Add
          </Button>
        </Nav>
      </Navbar>





      <canvas id="acquisitions" width="100" height="100"></canvas>




      <div className="table-responsive custom-scroll mt-5"
        style={{ width: '95%', margin: 'auto' }}
      >
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
          </tbody>
        </Table>
      </div>



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







    // <div>
    //   <h2>DNS Record Management</h2>
    //   <h2>Search trough Domain</h2>
    //   <form onSubmit={addRecord}>
    //     <input
    //       type="text"
    //       value={domain}
    //       onChange={(e) => setDomain(e.target.value)}
    //       placeholder="Domain"
    //       required
    //     />
    //     <input
    //       type="text"
    //       value={recordType}
    //       onChange={(e) => setRecordType(e.target.value)}
    //       placeholder="Record Type"
    //       required
    //     />
    //     <input
    //       type="text"
    //       value={recordData}
    //       onChange={(e) => setRecordData(e.target.value)}
    //       placeholder="Record Data"
    //       required
    //     />
    //     <button type="submit">Add Record</button>
    //     <button type="submit">Upload file</button>
    //   </form>

    //   {records.length === 0 ? (
    //     <p>No Record Found</p>
    //   ) : (
    //     <>
    //       <table>
    //         <thead>
    //           <tr>
    //             <th>Domain</th>
    //             <th>Record Type</th>
    //             <th>Record Data</th>
    //             <th>Action</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {records.map((record, index) => (
    //             <tr key={index}>
    //               <td>
    //                 <input
    //                   type="text"
    //                   value={record.domain ? record.domain : "No Domain Found"}
    //                   onChange={(e) =>
    //                     updateRecord(record._id, "domain", e.target.value)
    //                   }
    //                 />
    //               </td>
    //               <td>
    //                 <input
    //                   type="text"
    //                   value={record.recordType}
    //                   onChange={(e) =>
    //                     updateRecord(record._id, "recordType", e.target.value)
    //                   }
    //                 />
    //               </td>
    //               <td>
    //                 <input
    //                   type="text"
    //                   value={record.recordData}
    //                   onChange={(e) =>
    //                     updateRecord(record._id, "recordData", e.target.value)
    //                   }
    //                 />
    //               </td>
    //               <td>
    //                 <button onClick={() => deleteRecord(record._id)}>
    //                   Delete
    //                 </button>
    //               </td>
    //               <td>
    //                 <button onClick={() => updateRecord(record._id)}>
    //                   Update
    //                 </button>
    //               </td>
    //             </tr>
    //           ))}
    //         </tbody>
    //       </table>
    //     </>
    //   )}
    // </div>
  );
}

export default Dashboard
