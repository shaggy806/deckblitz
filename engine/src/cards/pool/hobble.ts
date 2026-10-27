import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 25497.
//
// "Can't block if it's black" reads the enchanted creature's current colours:
// the restriction applies while this Aura is attached to a black creature.

export default defineCard({
  name: "Hobble",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, draw a card.\nEnchanted creature can't attack.\nEnchanted creature can't block if it's black.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack"],
      text: "Enchanted creature can't attack.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["B"] } } },
      restrictions: ["cant-block"],
      text: "Enchanted creature can't block if it's black.",
    },
  ],
});
