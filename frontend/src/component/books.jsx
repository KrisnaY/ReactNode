import React, { useState } from "react";
import { Table } from "react-bootstrap";
import axios from "axios";
import EditBarang from "./EditBarang";

function Books(props) {
  const { data, onUpdated } = props;
  const [modal, setModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);

  const handleUpdateClick = (barang) => {
    setSelectedBarang(barang);
    setModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/deleteBarang/${id}`, {
        headers: { "x-access-token": localStorage.getItem("token") },
        withCredentials: true,
      });
      onUpdated();
    } catch (err) {
      console.error("Error deleting barang:", err);
    }
  };

  return (
    <>
      <Table striped="columns">
        <thead>
          <tr>
            <th>#</th>
            <th>Nama Barang</th>
            <th>Jumlah Barang</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((barang, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{barang.namaBarang}</td>
                <td>{barang.jmlBarang}</td>
                <td>
                  <button onClick={() => handleUpdateClick(barang)}>Edit</button>
                  <button onClick={() => handleDelete(barang.idBarang)}>Hapus</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Tidak memiliki barang</td>
            </tr>
          )}
        </tbody>
      </Table>

      {selectedBarang && (
        <EditBarang
          show={modal}
          barang={selectedBarang}
          onHide={() => setModal(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}

export default Books;
