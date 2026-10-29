import { defineCard } from "../define.js";

// Indefinitely (rule 305.7): the land loses its other land types and its
// rules-text abilities and taps for {G}. Snow stays as it was (the ruling).
export default defineCard({
  name: "Thelonite Monk",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Monk", "Cleric"],
  power: 1,
  toughness: 2,
  text: "{T}, Sacrifice a green creature: Target land becomes a Forest. (This effect lasts indefinitely.)",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "creature", colors: ["G"] } } },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Forest"], duration: "permanent" },
      resolve: null,
      text: "{T}, Sacrifice a green creature: Target land becomes a Forest.",
    },
  ],
});
