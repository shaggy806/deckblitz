import { defineCard } from "../define.js";

// A 3/3 red Elemental creature token (Wand of the Elements).
// Scryfall lists no printing of it.

export default defineCard({
  name: "3/3 Red Elemental Token",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
});
