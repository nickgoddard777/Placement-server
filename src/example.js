import { initDatabase } from "./db/init.js";
import { User } from "./db/models/user.js";

await initDatabase();

const user = new User({
  name: "Joe Bloggs",
  email: "jbloggs@email.com",
  password: "12345678",
});

const createdUser = await user.save();
await User.findByIdAndUpdate(createdUser._id, {
  $set: { name: "Joe Bloggs Jr." },
});

const users = await User.find();
console.log(users);
