import Barang from "../models/barang.js";
import jwt from "jsonwebtoken";

export async function addBarang(req, res) {
    try {
        const { namaBarang, jmlBarang } = req.body;
        const barang = new Barang({ namaBarang, jmlBarang, userId: req.user.id });
        await barang.save();

        const io = req.app.get('io');
        io.emit('newBarang', barang);

        res.json({ message: "Barang berhasil ditambahkan" });
    } catch (err) {
        // console.log(err);
        res.status(500).json({ message: "Error dalam memasukan barang" });
    }
}

export async function getBarangById(req, res) {
    try {
        const barang = await Barang.find({ userId: req.params.id });
        // console.log(barang);
        const payload = jwt.sign(
            { barang },
            process.env.JWT_SECRET)
        // console.log(payload);
        res.send(payload);
    } catch (err) {
        // console.log(err);
        res.status(500).json({ message: "Error mendapatkan barang" });
    }
}

export async function deleteBarang(req, res) {
    try {
        await Barang.findByIdAndDelete(req.params.id);

        const io = req.app.get('io');
        io.emit('deleteBarang', req.params.id);

        res.json({ message: "Barang berhasil di hapus" });
    } catch (err) {
        res.status(500).json({ message: "Error dalam melakukan delete barang" });
    }
}

export async function updateBarang(req, res) {
    try {
        const barang = await Barang.findById(req.params.id);
        if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });
        barang.namaBarang = req.body.namaBarang || barang.namaBarang;
        barang.jmlBarang = req.body.jmlBarang || barang.jmlBarang;
        await barang.save();

        const io = req.app.get('io');
        io.emit('updateBarang', barang);

        res.json({ message: "Barang berhasil di update" });
    } catch (err) {
        // console.log(err);
        res.status(500).json({ message: "Error dalam melakukan update barang" });
    }
}