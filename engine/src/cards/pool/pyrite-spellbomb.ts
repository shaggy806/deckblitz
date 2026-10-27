import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 8376. A Spellbomb: Ember Hauler's sacrifice
// shock, then Aether Spellbomb's cantrip.

export default defineCard({
  name: "Pyrite Spellbomb",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{R}, Sacrifice this artifact: It deals 2 damage to any target.\n{1}, Sacrifice this artifact: Draw a card.",
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{R}, Sacrifice this artifact: It deals 2 damage to any target.",
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice this artifact: Draw a card.",
    },
  ],
});
