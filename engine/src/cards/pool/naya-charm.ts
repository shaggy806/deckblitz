import { defineCard } from "../define.js";

export default defineCard({
  name: "Naya Charm",
  manaCost: "{R}{G}{W}",
  colors: ["R", "G", "W"],
  types: ["instant"],
  text: "Choose one —\n• Naya Charm deals 3 damage to target creature.\n• Return target card from a graveyard to its owner's hand.\n• Tap all creatures target player controls.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Naya Charm deals 3 damage to target creature.",
        targets: ["creature"],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      {
        text: "Return target card from a graveyard to its owner's hand.",
        targets: [{ kind: "card-in-graveyard", whose: "any" }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        text: "Tap all creatures target player controls.",
        targets: ["player"],
        effect: { kind: "tap-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
      },
    ],
  },
});
