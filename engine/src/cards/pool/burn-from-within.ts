import { defineCard } from "../define.js";

// EDHREC rank 12742.
//
// Both riders need damage actually dealt to a creature this way (the
// ruling: none when it's prevented or X is 0); the exile then applies to it
// dying this turn from any cause.
export default defineCard({
  name: "Burn from Within",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Burn from Within deals X damage to any target. If a creature is dealt damage this way, it loses indestructible until end of turn. If that creature would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "damage-dealt-this-way", to: 0 },
            { kind: "target", index: 0, filter: { type: "creature" } },
          ],
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "lose-keywords", target: 0, keywords: ["indestructible"], duration: "end-of-turn" },
            { kind: "exile-if-dies-this-turn", target: 0 },
          ],
        },
      },
    ],
  },
});
