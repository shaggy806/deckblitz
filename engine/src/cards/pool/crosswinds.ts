import { defineCard } from "../define.js";

// EDHREC rank 30488.
const TEXT = "Creatures with flying get -2/-0.";

export default defineCard({
  name: "Crosswinds",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [{ affects: { scope: "all-creatures", withKeyword: "flying" }, grantPt: [-2, 0], text: TEXT }],
});
