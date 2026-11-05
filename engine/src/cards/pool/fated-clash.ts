import { defineCard } from "../define.js";

// EDHREC rank 12050.
//
// The conditional flash (`flashIf`) reads the whole battlefield as the cast
// begins (rule 601.3d): some creature attacking and some creature blocking,
// whoever controls them (`anyController`).
export default defineCard({
  name: "Fated Clash",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 1, anyController: true },
        { kind: "controls", filter: { type: "creature", blocking: true }, atLeast: 1, anyController: true },
      ],
    },
  },
  text: "You may cast this spell as though it had flash if a creature is attacking and a creature is blocking.\nTarget creature you control and target creature an opponent controls each gain indestructible until end of turn. Then destroy all creatures.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "indestructible", duration: "end-of-turn" },
      { kind: "destroy-all", filter: { type: "creature" } },
    ],
  },
});
