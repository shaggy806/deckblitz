import { defineCard } from "../define.js";

export default defineCard({
  name: "Consuming Bonfire",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["kindred", "sorcery"],
  subtypes: ["Elemental"],
  text: "Choose one —\n• Consuming Bonfire deals 4 damage to target non-Elemental creature.\n• Consuming Bonfire deals 7 damage to target Treefolk creature.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Consuming Bonfire deals 4 damage to target non-Elemental creature.",
        targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", notSubtypes: ["Elemental"] } }],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: "Consuming Bonfire deals 7 damage to target Treefolk creature.",
        targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", subtype: "Treefolk" } }],
        effect: { kind: "damage", amount: 7, target: 0 },
      },
    ],
  },
});
