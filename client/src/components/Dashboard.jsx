
import { useState,useEffect} from "react";

const Dashboard = () => {
      const [domain, setDomain] = useState("");
      const [recordType, setRecordType] = useState("");
      const [recordData, setRecordData] = useState("");
    const [records, setRecords] = useState([]);
        
//--------------------------search function-----------------------------------
const fetchDnsRecords = async () => {
  try {
    const response = await fetch(`http://localhost:3000/dns/records/${domain}`);

    const data = await response.json();
       setRecords(data.data);

  } catch (error) {
    console.error(error.message);
  }
};

useEffect(() => {
  fetchDnsRecords();
}, [domain]);
//--------------------------------------------------------------------------------------
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
       setRecords((prevRecords) => [...prevRecords, data.data]);
    fetchDnsRecords(); 
    setDomain("");
    setRecordType("");
    setRecordData("");
  } catch (error) {
    console.error(error.message);
  }
};

    const deleteRecord = async (id) => {
    
    try {
      console.log("id",id)
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


    
  return (
    <div>
      <h2>DNS Record Management</h2>
      <h2>Search trough Domain</h2>
      <form onSubmit={addRecord}>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Domain"
          required
        />
        <input
          type="text"
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          placeholder="Record Type"
          required
        />
        <input
          type="text"
          value={recordData}
          onChange={(e) => setRecordData(e.target.value)}
          placeholder="Record Data"
          required
        />
        <button type="submit">Add Record</button>
        <input
          type="file"
          id="fileInput"
          placeholder ="select file to upload"
          style={{ padding: "3px", fontSize: "20px" }}
          onChange={handelUploadfile}
        />
        {/* <button type="submit" onClick={handelUploadfile}>Upload file</button>  */}
      </form>

      {records.length === 0 ? (
        <p>No Record Found</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Record Type</th>
                <th>Record Data</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={record.domain ? record.domain : "No Domain Found"}
                      onChange={(e) =>
                        updateRecord(record._id, "domain", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={record.recordType}
                      onChange={(e) =>
                        updateRecord(record._id, "recordType", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={record.recordData}
                      onChange={(e) =>
                        updateRecord(record._id, "recordData", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => deleteRecord(record._id)}>
                      Delete
                    </button>
                  </td>
                  <td>
                    <button onClick={() => updateRecord(record._id)}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Dashboard
