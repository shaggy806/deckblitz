import { defineCard } from "../define.js";

// A 2/2 green Beast — Keeper of the Beasts' token. ("Beast Token" is the 4/4
// one; the engine keys tokens by name.)
export default defineCard({
  name: "2/2 Beast Token",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
});
