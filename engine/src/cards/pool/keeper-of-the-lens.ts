import { defineCard } from "../define.js";

// EDHREC rank 25388.
//
// Rulings:
//   Keeper of the Lens doesn't stop your opponents from looking at face-down creatures they control.
//   Keeper of the Lens allows you to look at face-down creatures you don't control whenever you want
//     to, even if you don't have priority. This action doesn't use the stack.
//   Keeper of the Lens doesn't let you look at other players' face-down spells while they're on the
//     stack.

const TEXT = "You may look at face-down creatures you don't control any time.";

export default defineCard({
  name: "Keeper of the Lens",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 1,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, visibility: { looksAtFaceDownCreatures: true }, text: TEXT }],
});
