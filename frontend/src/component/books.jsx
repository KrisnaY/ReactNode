import React from 'react'
import { Table } from 'react-bootstrap'

function Books(props) {
  const { data, onInsert } = props;
  console.log(data);
  return (
    <>
    <Table striped="columns">
      <thead>
        <tr>
          <th>#</th>
          <th>Nama Barang</th>
          <th>Jumlah Barang</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(data) && data.length > 0 ? (
          data.map((book, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{book.namaBarang}</td>
              <td>{book.jmlBarang}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3">No books available</td>
          </tr>
        )}
      </tbody>
    </Table>
    </>
  )
}

export default Books