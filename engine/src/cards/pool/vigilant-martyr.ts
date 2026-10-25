import { defineCard } from "../define.js";

// EDHREC rank 21066. Pteron Ghost's regeneration; Cerulean Drake's counter,
// narrowed to a spell with an enchantment among its targets.

export default defineCard({
  name: "Vigilant Martyr",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: Regenerate target creature.\n{W}{W}, {T}, Sacrifice this creature: Counter target spell that targets an enchantment.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "Sacrifice this creature: Regenerate target creature.",
    },
    {
      cost: { mana: "{W}{W}", tap: true, sacrifice: "self" },
      targets: [{ kind: "spell", filter: { targets: { permanent: { type: "enchantment" } } } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{W}{W}, {T}, Sacrifice this creature: Counter target spell that targets an enchantment.",
    },
  ],
});
