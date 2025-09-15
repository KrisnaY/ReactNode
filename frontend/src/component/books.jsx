import React, { useState } from "react";
import { Table, Button } from "react-bootstrap";
import axios from "axios";
import EditBarang from "./EditBarang";
import { PencilSquare, Trash } from "react-bootstrap-icons";

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
      <Table bordered hover responsive>
        <thead className="table-dark">
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
                <td className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleUpdateClick(barang)}
                  >
                    <PencilSquare />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(barang.idBarang)}
                  >
                    <Trash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Tidak memiliki barang
              </td>
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
