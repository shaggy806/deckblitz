import { defineCard } from "../define.js";

// A 0/1 green Sheep creature token (Ovinomancer). The pool's "Sheep Token" is
// a 1/1 white one, so this is keyed apart and named Sheep by `tokenName`.

export default defineCard({
  name: "Green Sheep Token",
  tokenName: "Sheep",
  art: "3acb4442-e7e5-482b-9ce8-f1af8069114e",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sheep"],
  power: 0,
  toughness: 1,
  text: "",
});
