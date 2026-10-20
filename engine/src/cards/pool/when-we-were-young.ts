import { defineCard } from "../define.js";

// EDHREC rank 25538.
//
// Rulings:
//   [2022-02-18] The artifact and the enchantment may be the same permanent.
//   [2022-02-18] Whether you control an artifact and an enchantment is checked as When We Were
//     Young resolves.
//   [2022-02-18] "Those creatures" refers to the target creatures, not the artifact and the
//     enchantment.

export default defineCard({
  name: "When We Were Young",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Up to two target creatures each get +2/+2 until end of turn. If you control an artifact and an enchantment, those creatures also gain lifelink until end of turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
            { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
          ],
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 1, keyword: "lifelink", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
