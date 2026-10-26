import { defineCard } from "../define.js";

// EDHREC rank 30197.
//
// Rulings:
//   Creatures with reach (such as Giant Spider) don't actually have flying, so they can't block
//     this.
const TEXT = "This creature can't be blocked except by creatures with flying.";

export default defineCard({
  name: "Treetop Rangers",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Ranger"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { notKeyword: "flying" }, text: TEXT }],
});
