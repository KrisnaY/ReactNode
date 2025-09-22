import mongoose from "mongoose";

const barangSchema = new mongoose.Schema({
    namaBarang: String,
    jmlBarang: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users"}
});

const Barang = mongoose.model('Barang', barangSchema);

export default Barang;