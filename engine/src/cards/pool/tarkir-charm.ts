import { defineCard } from "../define.js";

// Playtest card. Each mode is the named card's effect, the parenthetical its summary: Bathe in
// Dragonfire, Hordeling Outburst (red 1/1 Goblins) and Sarkhan's Triumph as the pool authors them.

const BATHE = "Bathe in Dragonfire (4 damage to a creature.)";
const OUTBURST = "Hordeling Outburst (Create three 1/1 Goblin tokens.)";
const TRIUMPH = "Sarkhan's Triumph (Search for a dragon.)";

export default defineCard({
  name: "Tarkir Charm",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one —\n• ${BATHE}\n• ${OUTBURST}\n• ${TRIUMPH}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: BATHE,
        targets: ["creature"],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: OUTBURST,
        targets: [],
        effect: { kind: "create-token", token: "Goblin Token", count: 3 },
      },
      {
        text: TRIUMPH,
        targets: [],
        effect: {
          kind: "search-library",
          filter: { subtype: "Dragon", type: "creature" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
    ],
  },
});
