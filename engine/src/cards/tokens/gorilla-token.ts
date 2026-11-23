import { defineCard } from "../define.js";

// A 2/2 green Gorilla creature token (Gorilla Tactics). No token printing of
// it in the Oracle snapshot.

export default defineCard({
  name: "Gorilla Token",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Gorilla"],
  power: 2,
  toughness: 2,
  text: "",
});
