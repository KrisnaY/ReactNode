import React, { useState } from "react";
import { Table, Button } from "react-bootstrap";
import EditBarang from "./EditBarang";
import { PencilSquare, Trash } from "react-bootstrap-icons";

function Books(props) {
  const { data, onUpdated, socket } = props;
  const [modal, setModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);

  const handleUpdateClick = (barang) => {
    setSelectedBarang(barang);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure to delete this item?")) return;
    try {
      if(!socket) return;
      socket.emit('deleteBarang', id, (res) => {
        if(res && res.success) {
            alert('Data berhasil dihapus');
            if (onUpdated) onUpdated();
        } else {
            alert('Gagal menghapus data: ' + res.error);
        }
      });
    } catch (error) {
      console.error("Error menghapus barang:", error);
      alert("Gagal menghapus barang");
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
                    onClick={() => handleDelete(barang._id)}
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
          socket={socket}
          onHide={() => setModal(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}

export default Books;
