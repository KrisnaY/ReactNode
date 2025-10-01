import Barang from "../models/barang.js";
import jwt from "jsonwebtoken";

export async function addBarang(id, data) {
    const { namaBarang, jmlBarang } = data;
    console.log("data : ", data);
    console.log("id user : ", id);
    const barang = new Barang({ namaBarang, jmlBarang, userId: id });
    await barang.save();

    return barang;
}

export async function getBarangById(id) {
    const barang = await Barang.find({ userId: id });
    // console.log("barang :", barang);
    const payload = jwt.sign(
        { barang },
        process.env.JWT_SECRET)
    // console.log("barang :", payload);
    return payload;
}

export async function deleteBarang(id) {
    const deleted = await Barang.findByIdAndDelete(id);
    return deleted;
}

export async function updateBarang(id, data) {
    const barang = await Barang.findById(id);
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });
    barang.namaBarang = data.namaBarang || barang.namaBarang;
    barang.jmlBarang = data.jmlBarang || barang.jmlBarang;
    await barang.save();

    return barang;
}