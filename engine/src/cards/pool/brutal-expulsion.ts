import { defineCard } from "../define.js";

// EDHREC rank 20536.

export default defineCard({
  name: "Brutal Expulsion",
  manaCost: "{2}{U}{R}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nChoose one or both —\n• Return target spell or creature to its owner's hand.\n• Brutal Expulsion deals 2 damage to target creature or planeswalker. If that creature or planeswalker would die this turn, exile it instead.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Return target spell or creature to its owner's hand.",
        targets: [{ kind: "one-of", of: ["spell", "creature"] }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "return-to-hand", target: 0, from: "stack" },
            { kind: "return-to-hand", target: 0 },
          ],
        },
      },
      {
        text: "Brutal Expulsion deals 2 damage to target creature or planeswalker. If that creature or planeswalker would die this turn, exile it instead.",
        targets: [
          {
            kind: "permanent",
            whose: "any",
            filter: { typesAnyOf: ["creature", "planeswalker"] },
          },
        ],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 2, target: 0 },
            { kind: "exile-if-dies-this-turn", target: 0 },
          ],
        },
      },
    ],
  },
});
