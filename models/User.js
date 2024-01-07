const { Schema, model } = require("mongoose")

const UserSchema = new Schema({
    name: { type: String, required: [true, "User Name Is Required"] },
    email: { type: String, required: [true, "Eamil Is Required"] },
    password: { type: String, required: [true, "Password Is Required"] },
    resetPass: {
        code: { type: String, default: null },
        expiresAt: { type: Date, default: null }
    }
}, { timestamps: true })

module.exports = model("User", UserSchema);