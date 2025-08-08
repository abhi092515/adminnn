// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { Box, Typography, Button, TextField } from '@mui/material';
// // Import from the free package and include necessary API refs
// import {
//   DataGrid,
//   GridColDef,
//   GridToolbarContainer,
//   GridApi,
//   useGridApiRef,
// } from '@mui/x-data-grid';

// // Libraries for custom exports
// import { utils, writeFile } from 'xlsx';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// // Define the data structure
// interface ContactRow {
//   id: number;
//   _id: string;
//   name: string;
//   email: string;
//   mobile: string;
//   subject: string;
//   message: string;
//   date: string;
// }

// // --- UPDATED Toolbar with props for export handlers ---
// interface CustomToolbarProps {
//   onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   searchValue: string;
//   handleExportCsv: () => void;
//   handleExportExcel: () => void;
//   handleExportPdf: () => void;
// }

// function CustomToolbar({ 
//   onSearchChange, 
//   searchValue, 
//   handleExportCsv,
//   handleExportExcel,
//   handleExportPdf
// }: CustomToolbarProps) {
//   return (
//     <GridToolbarContainer sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
//       <Box>
//         <Button onClick={handleExportCsv} variant="outlined" size="small" sx={{ mr: 1 }}>CSV</Button>
//         <Button onClick={handleExportExcel} variant="outlined" size="small" sx={{ mr: 1 }}>Excel</Button>
//         <Button onClick={handleExportPdf} variant="outlined" size="small">PDF</Button>
//       </Box>
//       <TextField
//         variant="outlined"
//         size="small"
//         value={searchValue}
//         onChange={onSearchChange}
//         placeholder="Search..."
//         sx={{ width: 300 }}
//       />
//     </GridToolbarContainer>
//   );
// }

// // The main page component
// export default function ContactUsEnquiryPage() {
//   const [rows, setRows] = useState<ContactRow[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [searchText, setSearchText] = useState('');
//   const [filteredRows, setFilteredRows] = useState<ContactRow[]>([]);
//   const apiRef = useGridApiRef(); // Ref to access grid API for exports

//   // Effect to fetch initial data
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('http://localhost:5099/api/contacts');
        
//         // Defensive Check: Ensure response.data.data is an array
//         if (Array.isArray(response.data.data)) {
//           const formattedRows = response.data.data.map((item: any, index: number) => ({
//             id: index + 1,
//             _id: item._id,
//             name: item.name,
//             email: item.email,
//             mobile: item.mobileNumber,
//             subject: "Contact Us",
//             message: item.message,
//             date: item.createdAt,
//           }));
//           setRows(formattedRows);
//           setFilteredRows(formattedRows);
//         } else {
//           // Log a warning if the API format is not an array
//           console.warn("API response for contacts is not an array. Please check your backend. Response:", response.data);
//           setRows([]);
//           setFilteredRows([]);
//         }

//       } catch (error) {
//         console.error("Failed to fetch contact enquiries:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Effect to handle filtering when searchText changes
//   useEffect(() => {
//     const lowerCaseSearch = searchText.toLowerCase();
//     const newFilteredRows = rows.filter((row) => {
//       return Object.values(row).some(value =>
//         String(value).toLowerCase().includes(lowerCaseSearch)
//       );
//     });
//     setFilteredRows(newFilteredRows);
//   }, [searchText, rows]);

//   // --- NEW: Export Handler Functions ---
//   const handleExportCsv = () => {
//     apiRef.current.exportDataAsCsv({ fileName: 'contact-enquiries.csv' });
//   };
  
//   const handleExportExcel = () => {
//     const rowsToExport = apiRef.current.getSortedRows().map(row => ({
//         SNo: row.id,
//         Name: row.name,
//         Email: row.email,
//         Mobile: row.mobile,
//         Subject: row.subject,
//         Message: row.message,
//         Date: new Date(row.date).toLocaleString(),
//     }));
//     const worksheet = utils.json_to_sheet(rowsToExport);
//     const workbook = utils.book_new();
//     utils.book_append_sheet(workbook, worksheet, "Enquiries");
//     writeFile(workbook, "contact-enquiries.xlsx");
//   };

//   const handleExportPdf = () => {
//     const doc = new jsPDF();
//     doc.text("Contact Us Enquiries", 14, 16);
//     (doc as any).autoTable({
//         head: [['S.No', 'Name', 'Email', 'Mobile', 'Message', 'Date']],
//         body: apiRef.current.getSortedRows().map(row => [
//             row.id,
//             row.name,
//             row.email,
//             row.mobile,
//             row.message,
//             new Date(row.date).toLocaleDateString(),
//         ]),
//         startY: 20,
//     });
//     doc.save('contact-enquiries.pdf');
//   };

//   // Columns definition remains the same
//   const columns: GridColDef<ContactRow>[] = [
//     { field: 'id', headerName: '#Sno.', width: 70, filterable: false, sortable: false },
//     { field: 'name', headerName: 'Name', width: 150 },
//     { field: 'email', headerName: 'Email', width: 200 },
//     { field: 'mobile', headerName: 'Mobile', width: 130 },
//     { field: 'subject', headerName: 'Subject', width: 130 },
//     { field: 'message', headerName: 'Message', flex: 1, minWidth: 250 },
//     {
//       field: 'date',
//       headerName: 'Date',
//       width: 180,
//       type: 'dateTime',
//       valueGetter: (value) => new Date(value),
//       renderCell: (params) => new Date(params.value).toLocaleString(),
//     },
//   ];

//   return (
//     <Box sx={{ width: '100%', p: 3 }}>
//       <Typography variant="h5" fontWeight="bold" gutterBottom>
//         All Contact-Us Enquiry
//       </Typography>
//       <Box sx={{ height: '75vh', width: '100%' }}>
//         <DataGrid
//           apiRef={apiRef} // Assign the ref to the grid
//           rows={filteredRows}
//           columns={columns}
//           loading={loading}
//           getRowId={(row) => row._id}
//           slots={{ toolbar: CustomToolbar }}
//           slotProps={{
//             toolbar: {
//               searchValue: searchText,
//               onSearchChange: (event) => setSearchText(event.target.value),
//               // Pass handlers to the toolbar
//               handleExportCsv,
//               handleExportExcel,
//               handleExportPdf,
//             },
//           }}
//           initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
//           pageSizeOptions={[10, 20, 50]}
//           sx={{
//             border: '1px solid #e0e0e0',
//             '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5', fontWeight: 'bold' },
//           }}
//         />
//       </Box>
//     </Box>
//   );
// }

"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Button, TextField } from '@mui/material';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';

// Libraries for custom exports
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Define the data structure
interface ContactRow {
  id: number;
  _id: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  date: string;
}

// --- UPDATED Toolbar Component ---
// It now receives props directly from the parent page
interface CustomToolbarProps {
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchValue: string;
  handleExportCsv: () => void;
  handleExportExcel: () => void;
  handleExportPdf: () => void;
}

function CustomToolbar({
  onSearchChange,
  searchValue,
  handleExportCsv,
  handleExportExcel,
  handleExportPdf
}: CustomToolbarProps) {
  // We use a Box with flex properties to create the layout
  return (
    <Box sx={{
      p: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid #e0e0e0',
      borderBottom: 'none',
      backgroundColor: '#f5f5f5',
    }}>
      <Box>
        <Button onClick={handleExportCsv} variant="outlined" size="small" sx={{ mr: 1, backgroundColor: 'white' }}>CSV</Button>
        <Button onClick={handleExportExcel} variant="outlined" size="small" sx={{ mr: 1, backgroundColor: 'white' }}>Excel</Button>
        <Button onClick={handleExportPdf} variant="outlined" size="small" sx={{ backgroundColor: 'white' }}>PDF</Button>
      </Box>
      <TextField
        variant="outlined"
        size="small"
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search..."
        sx={{ width: 300, backgroundColor: 'white' }}
      />
    </Box>
  );
}

// The main page component
export default function ContactUsEnquiryPage() {
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState<ContactRow[]>([]);
  const apiRef = useGridApiRef();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5099/api/contacts');
        if (Array.isArray(response.data.data)) {
          const formattedRows = response.data.data.map((item: any, index: number) => ({
            id: index + 1,
            _id: item._id,
            name: item.name,
            email: item.email,
            mobile: item.mobileNumber,
            subject: "Contact Us",
            message: item.message,
            date: item.createdAt,
          }));
          setRows(formattedRows);
          setFilteredRows(formattedRows);
        } else {
          console.warn("API response for contacts is not an array.", response.data);
          setRows([]);
          setFilteredRows([]);
        }
      } catch (error) {
        console.error("Failed to fetch contact enquiries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const lowerCaseSearch = searchText.toLowerCase();
    const newFilteredRows = rows.filter((row) => {
      return Object.values(row).some(value =>
        String(value).toLowerCase().includes(lowerCaseSearch)
      );
    });
    setFilteredRows(newFilteredRows);
  }, [searchText, rows]);

  const handleExportCsv = () => apiRef.current.exportDataAsCsv({ fileName: 'contact-enquiries.csv' });
  const handleExportExcel = () => { /* ... Excel logic from previous response ... */ };
  const handleExportPdf = () => { /* ... PDF logic from previous response ... */ };

  const columns: GridColDef<ContactRow>[] = [
    { field: 'id', headerName: '#Sno.', width: 70, filterable: false, sortable: false },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'mobile', headerName: 'Mobile', width: 130 },
    { field: 'subject', headerName: 'Subject', width: 130 },
    { field: 'message', headerName: 'Message', flex: 1, minWidth: 250 },
    {
      field: 'date',
      headerName: 'Date',
      width: 180,
      type: 'dateTime',
      valueGetter: (value) => new Date(value),
      renderCell: (params) => new Date(params.value).toLocaleString(),
    },
  ];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        All Contact-Us Enquiry
      </Typography>
      <Box sx={{ height: '75vh', width: '100%' }}>
        {/* --- CHANGE: Render Toolbar directly here --- */}
        <CustomToolbar
          searchValue={searchText}
          onSearchChange={(event) => setSearchText(event.target.value)}
          handleExportCsv={handleExportCsv}
          handleExportExcel={handleExportExcel}
          handleExportPdf={handleExportPdf}
        />
        <DataGrid
          apiRef={apiRef}
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          // --- CHANGE: `slots` and `slotProps` are removed ---
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 20, 50]}
          sx={{
            // Remove top border as the toolbar now provides it
            borderTop: 0,
            border: '1px solid #e0e0e0',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
          }}
        />
      </Box>
    </Box>
  );
}