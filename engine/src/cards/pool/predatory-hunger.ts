import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] A “creature spell” is any spell with the type Creature, even if it has other
//     types such as Artifact or Enchantment. Older cards of type Summon are also Creature spells.

const CAST_TEXT = "Whenever an opponent casts a creature spell, put a +1/+1 counter on enchanted creature.";

export default defineCard({
  name: "Predatory Hunger",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${CAST_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
