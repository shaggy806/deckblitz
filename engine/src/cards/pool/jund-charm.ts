import { defineCard } from "../define.js";

export default defineCard({
  name: "Jund Charm",
  manaCost: "{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["instant"],
  text: "Choose one —\n• Exile target player's graveyard.\n• Jund Charm deals 2 damage to each creature.\n• Put two +1/+1 counters on target creature.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Exile target player's graveyard.",
        targets: ["player"],
        effect: { kind: "exile-graveyard", target: 0 },
      },
      {
        text: "Jund Charm deals 2 damage to each creature.",
        effect: { kind: "damage-all", amount: 2, filter: { type: "creature" } },
      },
      {
        text: "Put two +1/+1 counters on target creature.",
        targets: ["creature"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
    ],
  },
});
