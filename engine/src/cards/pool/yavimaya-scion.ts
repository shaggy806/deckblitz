import { defineCard } from "../define.js";

// EDHREC rank 30333.

export default defineCard({
  name: "Yavimaya Scion",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 4,
  text: "Protection from artifacts",
  static: [{ affects: { scope: "self" }, protection: { types: ["artifact"] }, text: "Protection from artifacts" }],
});
