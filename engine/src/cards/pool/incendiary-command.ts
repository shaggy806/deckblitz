import { defineCard } from "../define.js";

// The fourth mode is Dark Deal's shape: each player draws for what they
// themselves discarded.
export default defineCard({
  name: "Incendiary Command",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose two —\n• Incendiary Command deals 4 damage to target player or planeswalker.\n• Incendiary Command deals 2 damage to each creature.\n• Destroy target nonbasic land.\n• Each player discards all the cards in their hand, then draws that many cards.",
  targets: [],
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Incendiary Command deals 4 damage to target player or planeswalker.",
        targets: ["player-or-planeswalker"],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: "Incendiary Command deals 2 damage to each creature.",
        targets: [],
        effect: { kind: "damage-all", amount: 2, filter: { type: "creature" } },
      },
      {
        text: "Destroy target nonbasic land.",
        targets: [{ kind: "permanent", filter: { type: "land", notSupertype: "basic" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Each player discards all the cards in their hand, then draws that many cards.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "each-player" },
            { kind: "draw", who: "each-player", amount: { thisWay: "discarded", who: "each" } },
          ],
        },
      },
    ],
  },
});
