import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of each player's upkeep, that player may sacrifice a creature of their choice. If that player doesn't, they lose 5 life and you sacrifice this enchantment.";

export default defineCard({
  name: "Pillar Tombs of Aku",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        options: [{ sacrifice: { type: "creature", controlledBy: "you" }, text: "Sacrifice a creature" }],
        ifDidnt: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 5, who: "that-player" },
            { kind: "sacrifice-source" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
