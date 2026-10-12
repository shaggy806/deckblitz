import { defineCard } from "../define.js";

export default defineCard({
  name: "Shredded Sails",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Choose one —\n• Destroy target artifact.\n• Shredded Sails deals 4 damage to target creature with flying.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Shredded Sails deals 4 damage to target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
    ],
  },
});
