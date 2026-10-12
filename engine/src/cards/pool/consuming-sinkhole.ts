import { defineCard } from "../define.js";

export default defineCard({
  name: "Consuming Sinkhole",
  manaCost: "{3}{R}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nChoose one —\n• Exile target land creature.\n• Consuming Sinkhole deals 4 damage to target player or planeswalker.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Exile target land creature.",
        targets: [{ kind: "permanent", filter: { types: ["land", "creature"] } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Consuming Sinkhole deals 4 damage to target player or planeswalker.",
        targets: ["player-or-planeswalker"],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
    ],
  },
});
