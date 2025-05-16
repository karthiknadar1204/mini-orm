"use client";

import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [connectionUrl, setConnectionUrl] = useState("");
  const [tables, setTables] = useState([]);
  const [schemas, setSchemas] = useState({});
  const [selectedTable, setSelectedTable] = useState("");
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({});
  const [updateData, setUpdateData] = useState({ id: "" });
  const [deleteId, setDeleteId] = useState("");
  const [message, setMessage] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [queryResult, setQueryResult] = useState(null);

  const connect = async () => {
    setMessage("");
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionUrl }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setTables(data.tables);
      setSchemas(data.schemas);
      setMessage("Connected successfully! Select a table to proceed.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const disconnect = async () => {
    setMessage("");
    try {
      const res = await fetch("/api/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setTables([]);
      setSchemas({});
      setRecords([]);
      setSelectedTable("");
      setFormData({});
      setUpdateData({ id: "" });
      setMessage("Disconnected successfully.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const fetchRecords = async () => {
    if (!selectedTable) {
      setMessage("Please select a table.");
      return;
    }
    setMessage("");
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: selectedTable, operation: "findAll" }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setRecords(data.result);
      setMessage("Records fetched successfully.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      setMessage("Please select a table.");
      return;
    }
    setMessage("");
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: selectedTable,
          operation: "create",
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setMessage("Record created successfully.");
      setFormData({}); // Reset form
      fetchRecords();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      setMessage("Please select a table.");
      return;
    }
    setMessage("");
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: selectedTable,
          operation: "update",
          id: updateData.id,
          data: formData,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setMessage("Record updated successfully.");
      setUpdateData({ id: "" });
      setFormData({});
      fetchRecords();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      setMessage("Please select a table.");
      return;
    }
    setMessage("");
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: selectedTable,
          operation: "delete",
          id: deleteId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      setMessage("Record deleted successfully.");
      setDeleteId("");
      fetchRecords();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleTableChange = (table) => {
    setSelectedTable(table);
    setRecords([]);
    setFormData({});
    setUpdateData({ id: "" });
    setDeleteId("");
    setMessage("");
  };

  const executeQuery = async () => {
    try {
      // Parse the query input
      let operation, data, id, tableName;

      // Extract table name and operation
      const queryMatch = queryInput.match(
        /^(\w+)\.(findAll|findById|create|update|delete)\(/
      );
      if (!queryMatch) {
        setMessage(
          "Invalid query syntax. Please use format: tableName.operation()"
        );
        return;
      }

      tableName = queryMatch[1];
      operation = queryMatch[2];

      // Validate table exists
      if (!tables.includes(tableName)) {
        setMessage(
          `Table "${tableName}" does not exist. Available tables: ${tables.join(", ")}`
        );
        return;
      }

      if (operation === "findAll") {
        // No additional parsing needed
      } else if (operation === "findById") {
        const idMatch = queryInput.match(/findById\((\d+)\)/);
        if (!idMatch) {
          setMessage("Invalid ID format in findById operation");
          return;
        }
        id = idMatch[1];
      } else if (operation === "create") {
        const dataMatch = queryInput.match(/create\((.*)\)/s);
        if (dataMatch) {
          try {
            data = JSON.parse(dataMatch[1]);
          } catch (e) {
            setMessage("Invalid JSON in create operation");
            return;
          }
        }
      } else if (operation === "update") {
        const updateMatch = queryInput.match(/update\((\d+),\s*(.*)\)/s);
        if (updateMatch) {
          id = updateMatch[1];
          try {
            data = JSON.parse(updateMatch[2]);
          } catch (e) {
            setMessage("Invalid JSON in update operation");
            return;
          }
        }
      } else if (operation === "delete") {
        const idMatch = queryInput.match(/delete\((\d+)\)/);
        if (!idMatch) {
          setMessage("Invalid ID format in delete operation");
          return;
        }
        id = idMatch[1];
      }

      // Execute the query
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: tableName,
          operation,
          data,
          id,
        }),
      });

      const result = await res.json();
      if (result.error) {
        setMessage(`Error: ${result.error}`);
        return;
      }

      setQueryResult(result.result);
      setMessage("Query executed successfully");

      // Refresh records if needed
      if (["create", "update", "delete"].includes(operation)) {
        setSelectedTable(tableName); // Update selected table
        fetchRecords();
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>ORM Playground</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4">PostgreSQL ORM Playground</h1>

      {/* Documentation Section */}
      <div className="mb-6 p-4 bg-gray-800 rounded text-white">
        <h2 className="text-xl font-bold mb-2 text-white">
          ORM Syntax Documentation
        </h2>
        <p className="mb-2 text-gray-200">
          This minimalistic ORM provides simple methods to interact with your
          PostgreSQL database. Use the following syntax:
        </p>
        <ul className="list-disc pl-5 text-gray-200">
          <li>
            <code className="bg-gray-700 px-1 rounded text-white">
              model.findAll()
            </code>
            : Retrieves all records from the table.
          </li>
          <li>
            <code className="bg-gray-700 px-1 rounded text-white">
              model.findById(id)
            </code>
            : Retrieves a record by its ID.
          </li>
          <li>
            <code className="bg-gray-700 px-1 rounded text-white">
              model.create(data)
            </code>
            : Creates a new record with the provided data (e.g.,{" "}
            <code className="bg-gray-700 px-1 rounded text-white">
              {"{"}"name": "John", "email": "john@example.com"{"}"}
            </code>
            ).
          </li>
          <li>
            <code className="bg-gray-700 px-1 rounded text-white">
              model.update(id, data)
            </code>
            : Updates a record by ID with new data.
          </li>
          <li>
            <code className="bg-gray-700 px-1 rounded text-white">
              model.delete(id)
            </code>
            : Deletes a record by ID.
          </li>
        </ul>
        <p className="mt-2 text-gray-200">
          Example: For a{" "}
          <code className="bg-gray-700 px-1 rounded text-white">users</code>{" "}
          table,{" "}
          <code className="bg-gray-700 px-1 rounded text-white">
            model.create({"{"}"name": "John", "email": "john@example.com"{"}"})
          </code>{" "}
          inserts a new user.
        </p>
        <p className="text-gray-200">
          Assumes tables have an{" "}
          <code className="bg-gray-700 px-1 rounded text-white">id</code>{" "}
          primary key. Use the forms below to test these methods.
        </p>
      </div>

      {/* Connection Section */}
      <div className="mb-6 p-4 bg-gray-800 rounded text-white">
        <label className="block mb-2 text-white">
          PostgreSQL Connection URL:
        </label>
        <input
          type="text"
          value={connectionUrl}
          onChange={(e) => setConnectionUrl(e.target.value)}
          placeholder="postgresql://user:pass@host:port/db?sslmode=require"
          className="border p-2 w-full mb-2 bg-gray-700 text-white placeholder-gray-400"
        />
        <div>
          <button
            onClick={connect}
            className="bg-blue-500 text-white p-2 rounded mr-2 hover:bg-blue-600"
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Table Selection and Schema */}
      {tables.length > 0 && (
        <div className="mb-6 p-4 bg-gray-800 rounded text-white">
          <label className="block mb-2 text-white">Select Table:</label>
          <select
            value={selectedTable}
            onChange={(e) => handleTableChange(e.target.value)}
            className="border p-2 w-full mb-2 bg-gray-700 text-white"
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
              <h3 className="text-lg font-bold text-white">
                Schema for {selectedTable}
              </h3>
              <table className="w-full border border-gray-600">
                <thead>
                  <tr>
                    <th className="border border-gray-600 p-2 bg-gray-700 text-white">
                      Column
                    </th>
                    <th className="border border-gray-600 p-2 bg-gray-700 text-white">
                      Data Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schemas[selectedTable].map((col) => (
                    <tr key={col.column_name}>
                      <td className="border border-gray-600 p-2 text-gray-200">
                        {col.column_name}
                      </td>
                      <td className="border border-gray-600 p-2 text-gray-200">
                        {col.data_type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={fetchRecords}
                className="bg-green-500 text-white p-2 rounded mt-2 hover:bg-green-600"
              >
                Fetch Records
              </button>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {message && <p className="mb-4 text-red-400">{message}</p>}

      {/* Records Display */}
      {records.length > 0 && (
        <div className="mb-6 p-4 bg-gray-800 rounded text-white">
          <h2 className="text-xl font-bold mb-2 text-white">Records</h2>
          <table className="w-full border border-gray-600">
            <thead>
              <tr>
                {schemas[selectedTable].map((col) => (
                  <th
                    key={col.column_name}
                    className="border border-gray-600 p-2 bg-gray-700 text-white"
                  >
                    {col.column_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  {schemas[selectedTable].map((col) => (
                    <td
                      key={col.column_name}
                      className="border border-gray-600 p-2 text-gray-200"
                    >
                      {record[col.column_name]?.toString() || ""}
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
          <div className="p-4 bg-gray-800 rounded text-white">
            <h2 className="text-xl font-bold mb-2 text-white">Create Record</h2>
            <form onSubmit={handleCreate}>
              {schemas[selectedTable].map(
                (col) =>
                  col.column_name !== "id" && (
                    <div key={col.column_name} className="mb-2">
                      <label className="block text-gray-200">
                        {col.column_name} ({col.data_type})
                      </label>
                      <input
                        type="text"
                        placeholder={col.column_name}
                        value={formData[col.column_name] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [col.column_name]: e.target.value,
                          })
                        }
                        className="border p-2 w-full bg-gray-700 text-white placeholder-gray-400"
                      />
                    </div>
                  )
              )}
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Create
              </button>
            </form>
          </div>

          {/* Update Form */}
          <div className="p-4 bg-gray-800 rounded text-white">
            <h2 className="text-xl font-bold mb-2 text-white">Update Record</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-2">
                <label className="block text-gray-200">ID</label>
                <input
                  type="text"
                  placeholder="ID"
                  value={updateData.id}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, id: e.target.value })
                  }
                  className="border p-2 w-full bg-gray-700 text-white placeholder-gray-400"
                />
              </div>
              {schemas[selectedTable].map(
                (col) =>
                  col.column_name !== "id" && (
                    <div key={col.column_name} className="mb-2">
                      <label className="block text-gray-200">
                        {col.column_name} ({col.data_type})
                      </label>
                      <input
                        type="text"
                        placeholder={col.column_name}
                        value={formData[col.column_name] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [col.column_name]: e.target.value,
                          })
                        }
                        className="border p-2 w-full bg-gray-700 text-white placeholder-gray-400"
                      />
                    </div>
                  )
              )}
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Update
              </button>
            </form>
          </div>

          {/* Delete Form */}
          <div className="p-4 bg-gray-800 rounded text-white">
            <h2 className="text-xl font-bold mb-2 text-white">Delete Record</h2>
            <form onSubmit={handleDelete}>
              <div className="mb-2">
                <label className="block text-gray-200">ID</label>
                <input
                  type="text"
                  placeholder="ID"
                  value={deleteId}
                  onChange={(e) => setDeleteId(e.target.value)}
                  className="border p-2 w-full bg-gray-700 text-white placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Query Playground */}
      {selectedTable && (
        <div className="mt-8 p-4 bg-gray-800 rounded text-white">
          <h2 className="text-xl font-bold mb-4 text-white">
            Query Playground
          </h2>

          {/* Example Syntax */}
          <div className="mb-4 p-4 bg-gray-700 rounded">
            <h3 className="font-bold mb-2 text-white">Example Syntax:</h3>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
              {`// Find all records from users table
users.findAll()

// Find by ID from users table
users.findById(1)

// Create record in users table
users.create({
  "email": "user@example.com",
  "password": "password123"
})

// Update record in users table
users.update(1, {
  "email": "new@example.com"
})

// Delete record from users table
users.delete(1)

// Example for products table
products.create({
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stock": 50
})

// Example for orders table
orders.create({
  "user_id": 1,
  "total_amount": 1499.99,
  "status": "pending"
})`}
            </pre>
          </div>

          {/* Query Input */}
          <div className="mb-4">
            <label className="block mb-2 font-bold text-white">
              Write your query:
            </label>
            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Enter your query here..."
              className="w-full h-32 p-2 border rounded font-mono bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Execute Button */}
          <button
            onClick={executeQuery}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Execute Query
          </button>

          {/* Query Result */}
          {queryResult && (
            <div className="mt-4">
              <h3 className="font-bold mb-2 text-white">Result:</h3>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
