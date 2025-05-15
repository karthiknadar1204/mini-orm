'use client'

import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [connectionUrl, setConnectionUrl] = useState('');
  const [tables, setTables] = useState([]);
  const [schemas, setSchemas] = useState({});
  const [selectedTable, setSelectedTable] = useState('');
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({});
  const [updateData, setUpdateData] = useState({ id: '' });
  const [deleteId, setDeleteId] = useState('');
  const [message, setMessage] = useState('');

  const connect = async () => {
    setMessage('');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionUrl }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setTables(data.tables);
      setSchemas(data.schemas);
      setMessage('Connected successfully! Select a table to proceed.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const disconnect = async () => {
    setMessage('');
    try {
      const res = await fetch('/api/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setTables([]);
      setSchemas({});
      setRecords([]);
      setSelectedTable('');
      setFormData({});
      setUpdateData({ id: '' });
      setMessage('Disconnected successfully.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const fetchRecords = async () => {
    if (!selectedTable) {
      setMessage('Please select a table.');
      return;
    }
    setMessage('');
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable, operation: 'findAll' }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setRecords(data.result);
      setMessage('Records fetched successfully.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      setMessage('Please select a table.');
      return;
    }
    setMessage('');
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          operation: 'create',
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setMessage('Record created successfully.');
      setFormData({}); // Reset form
      fetchRecords();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      setMessage('Please select a table.');
      return;
    }
    setMessage('');
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          operation: 'update',
          id: updateData.id,
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setMessage('Record updated successfully.');
      setUpdateData({ id: '' });
      setFormData({});
      fetchRecords();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      setMessage('Please select a table.');
      return;
    }
    setMessage('');
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          operation: 'delete',
          id: deleteId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setMessage('Record deleted successfully.');
      setDeleteId('');
      fetchRecords();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleTableChange = (table) => {
    setSelectedTable(table);
    setRecords([]);
    setFormData({});
    setUpdateData({ id: '' });
    setDeleteId('');
    setMessage('');
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>ORM Playground</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4">PostgreSQL ORM Playground</h1>

      {/* Documentation Section */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-2">ORM Syntax Documentation</h2>
        <p className="mb-2">This minimalistic ORM provides simple methods to interact with your PostgreSQL database. Use the following syntax:</p>
        <ul className="list-disc pl-5">
          <li><code>model.findAll()</code>: Retrieves all records from the table.</li>
          <li><code>model.findById(id)</code>: Retrieves a record by its ID.</li>
          <li><code>model.create(data)</code>: Creates a new record with the provided data (e.g., <code>{'{'}"name": "John", "email": "john@example.com"{'}'}</code>).</li>
          <li><code>model.update(id, data)</code>: Updates a record by ID with new data.</li>
          <li><code>model.delete(id)</code>: Deletes a record by ID.</li>
        </ul>
        <p className="mt-2">Example: For a <code>users</code> table, <code>model.create({'{'}"name": "John", "email": "john@example.com"{'}'})</code> inserts a new user.</p>
        <p>Assumes tables have an <code>id</code> primary key. Use the forms below to test these methods.</p>
      </div>

      {/* Connection Section */}
      <div className="mb-6">
        <label className="block mb-2">PostgreSQL Connection URL:</label>
        <input
          type="text"
          value={connectionUrl}
          onChange={(e) => setConnectionUrl(e.target.value)}
          placeholder="postgresql://user:pass@host:port/db?sslmode=require"
          className="border p-2 w-full mb-2"
        />
        <div>
          <button
            onClick={connect}
            className="bg-blue-500 text-white p-2 rounded mr-2"
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            className="bg-red-500 text-white p-2 rounded"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Table Selection and Schema */}
      {tables.length > 0 && (
        <div className="mb-6">
          <label className="block mb-2">Select Table:</label>
          <select
            value={selectedTable}
            onChange={(e) => handleTableChange(e.target.value)}
            className="border p-2 w-full mb-2"
          >
            <option value="">-- Select a table --</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
          {selectedTable && schemas[selectedTable] && (
            <div className="mb-4">
              <h3 className="text-lg font-bold">Schema for {selectedTable}</h3>
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border p-2">Column</th>
                    <th className="border p-2">Data Type</th>
                  </tr>
                </thead>
                <tbody>
                  {schemas[selectedTable].map((col) => (
                    <tr key={col.column_name}>
                      <td className="border p-2">{col.column_name}</td>
                      <td className="border p-2">{col.data_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={fetchRecords}
                className="bg-green-500 text-white p-2 rounded mt-2"
              >
                Fetch Records
              </button>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {message && <p className="mb-4 text-red-500">{message}</p>}

      {/* Records Display */}
      {records.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Records</h2>
          <table className="w-full border">
            <thead>
              <tr>
                {schemas[selectedTable].map((col) => (
                  <th key={col.column_name} className="border p-2">
                    {col.column_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  {schemas[selectedTable].map((col) => (
                    <td key={col.column_name} className="border p-2">
                      {record[col.column_name]?.toString() || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD Forms */}
      {selectedTable && schemas[selectedTable] && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Create Form */}
          <div>
            <h2 className="text-xl font-bold mb-2">Create Record</h2>
            <form onSubmit={handleCreate}>
              {schemas[selectedTable].map((col) => (
                col.column_name !== 'id' && (
                  <div key={col.column_name} className="mb-2">
                    <label className="block">{col.column_name} ({col.data_type})</label>
                    <input
                      type="text"
                      placeholder={col.column_name}
                      value={formData[col.column_name] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [col.column_name]: e.target.value })
                      }
                      className="border p-2 w-full"
                    />
                  </div>
                )
              ))}
              <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Create
              </button>
            </form>
          </div>

          {/* Update Form */}
          <div>
            <h2 className="text-xl font-bold mb-2">Update Record</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-2">
                <label className="block">ID</label>
                <input
                  type="text"
                  placeholder="ID"
                  value={updateData.id}
                  onChange={(e) => setUpdateData({ ...updateData, id: e.target.value })}
                  className="border p-2 w-full"
                />
              </div>
              {schemas[selectedTable].map((col) => (
                col.column_name !== 'id' && (
                  <div key={col.column_name} className="mb-2">
                    <label className="block">{col.column_name} ({col.data_type})</label>
                    <input
                      type="text"
                      placeholder={col.column_name}
                      value={formData[col.column_name] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [col.column_name]: e.target.value })
                      }
                      className="border p-2 w-full"
                    />
                  </div>
                )
              ))}
              <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Update
              </button>
            </form>
          </div>

          {/* Delete Form */}
          <div>
            <h2 className="text-xl font-bold mb-2">Delete Record</h2>
            <form onSubmit={handleDelete}>
              <div className="mb-2">
                <label className="block">ID</label>
                <input
                  type="text"
                  placeholder="ID"
                  value={deleteId}
                  onChange={(e) => setDeleteId(e.target.value)}
                  className="border p-2 w-full"
                />
              </div>
              <button type="submit" className="bg-red-500 text-white p-2 rounded">
                Delete
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}