
import { useState, useEffect } from "react";

const Chart = () => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  // Function to fetch all records
  const fetchRecords = async () => {
    try {
      const response = await fetch("http://localhost:3000/dns/getallrecords");
      const data = await response.json();
      console.log("Records data:", data.data);
      setRecords(data.data);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter records based on selected domain
  useEffect(() => {
    if (selectedDomain) {
      const filtered = records.filter(
        (record) => record.domain === selectedDomain
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords([]);
    }
  }, [selectedDomain, records]);

  // Handle dropdown change
  const handleDropdownChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  
  // const handleClickRecord = (record) => {
  //   console.log("Selected record:", record);
   
  // };

  return (
    <div>
      <h2>Select a Domain</h2>
      <select value={selectedDomain} onChange={handleDropdownChange}>
        <option value="">Select a domain</option>
        {records.map((record, index) => (
          <option key={index} value={record.domain}>
            {record.domain}
          </option>
        ))}
      </select>

      <h2>Records for {selectedDomain}</h2>
      <ul>
        {filteredRecords.map((record, index) => (
          <li key={index} onClick={() => handleClickRecord(record)}>
            {record.domain} - {record.recordType} - {record.recordData}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chart;





