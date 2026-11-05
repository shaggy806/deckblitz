import { defineCard } from "../define.js";

// EDHREC rank 14853.

const TEXT = "Whenever this creature attacks, each opponent who doesn't control an Elf loses 1 life.";

export default defineCard({
  name: "Thornbow Archer",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        whoIf: {
          kind: "not",
          of: { kind: "of-player", player: "that-player", condition: { kind: "controls", filter: { subtype: "Elf" }, atLeast: 1 } },
        },
        effect: { kind: "lose-life", amount: 1, who: "that-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
