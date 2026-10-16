import { defineCard } from "../define.js";

// EDHREC rank 9107.
// Makes Treasure → use "Treasure Token".
//
// "Disarm" and "Detonate" are flavour words on the modes. The Disarm mode's
// Treasures come only if the spell resolves — an illegal artifact target
// leaves it with no legal target, so nothing happens (rule 608.2b).

const DISARM_TEXT = "Disarm — Destroy target artifact. Create four Treasure tokens.";
const DETONATE_TEXT = "Detonate — Megaton's Fate deals 8 damage to each creature. Each player gets four rad counters.";

export default defineCard({
  name: "Megaton's Fate",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one —\n• ${DISARM_TEXT}\n• ${DETONATE_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DISARM_TEXT,
        targets: ["artifact"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "create-token", token: "Treasure Token", count: 4 },
          ],
        },
      },
      {
        text: DETONATE_TEXT,
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage-all", filter: { type: "creature" }, amount: 8 },
            { kind: "add-player-counters", counter: "rad", amount: 4, who: "each-player" },
          ],
        },
      },
    ],
  },
});
