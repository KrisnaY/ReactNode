import Barang from "../models/barang.js";
import jwt from "jsonwebtoken";

export async function addBarang(req, res) {
    try {
        const { namaBarang, jmlBarang } = req.body;
        const Barang = new Barang({ namaBarang, jmlBarang, userId: req.user.id });
        await Barang.save();
        res.json({ message: "Barang berhasil ditambahkan" });
    } catch (err) {
        res.status(500).json({ message: "Error dalam memasukan barang" });
    }
}

export async function getBarangById(req, res) {
    try {
        const barang = await Barang.find({ userId: req.params.id });
        const payload = jwt.sign(
            { id: barang._id, namaBarang: barang.namaBarang, jmlBarang: barang.jmlBarang, userId: barang.userId },
            process.env.JWT_SECRET,)
        res.json(barang);
    } catch (err) {
        res.status(500).json({ message: "Error mendapatkan barang" });
    }
}

export async function deleteBarang(req, res) {
    try {
        await Barang.findByIdAndDelete(req.params.id);
        res.json({ message: "Barang berhasil di hapus" });
    } catch (err) {
        res.status(500).json({ message: "Error dalam melakukan delete barang" });
    }
}
