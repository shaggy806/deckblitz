import { defineCard } from "../define.js";

// A 3/1 black Mindless-One creature token (Rise from the Nether). No token
// printing in the Oracle snapshot yet (Marvel: Darkhold Destiny preview).
export default defineCard({
  name: "Mindless-One Token",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Mindless-One"],
  power: 3,
  toughness: 1,
  text: "",
});
