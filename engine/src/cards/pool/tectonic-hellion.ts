import { defineCard } from "../define.js";

// Commander 2019. "Each player who controls the most lands" is every
// player tied for most, found as it resolves and fixed before anyone
// sacrifices (the ruling) — the second tied player still sacrifices two.

const TEXT = "Whenever this creature attacks, each player who controls the most lands sacrifices two lands of their choice.";

export default defineCard({
  name: "Tectonic Hellion",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 8,
  toughness: 5,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: {
            kind: "player-compare",
            stat: { controls: { type: "land" } },
            compare: "at-least",
            than: "each-opponent",
          },
        },
        effect: { kind: "sacrifice", who: "that-player", filter: { type: "land" }, count: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
