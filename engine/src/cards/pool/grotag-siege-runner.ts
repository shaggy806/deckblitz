import { defineCard } from "../define.js";

// EDHREC rank 30615.

export default defineCard({
  name: "Grotag Siege-Runner",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 1,
  text: "{R}, Sacrifice this creature: Destroy target creature with defender. This creature deals 2 damage to that creature's controller.",
  activated: [
    {
      // An illegal target stops the whole ability, damage too (the ruling).
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "defender" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "damage", amount: 2, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: "{R}, Sacrifice this creature: Destroy target creature with defender. This creature deals 2 damage to that creature's controller.",
    },
  ],
});
