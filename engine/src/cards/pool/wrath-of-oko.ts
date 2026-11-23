import { defineCard } from "../define.js";

// Playtest card. Oko, Thief of Crowns's +1 over every creature on the battlefield as it resolves
// (rule 611.2c: a creature that enters later is unaffected), lasting indefinitely.

export default defineCard({
  name: "Wrath of Oko",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "All creatures lose all abilities and become green Elk creatures with base power and toughness 3/3. (This effect lasts indefinitely. Just like Oko. Unfortunately.)",
  targets: [],
  effect: {
    kind: "become",
    filter: { type: "creature" },
    power: 3,
    toughness: 3,
    setTypes: ["creature"],
    setSubtypes: ["Elk"],
    setColors: ["G"],
    loseAbilities: true,
    duration: "permanent",
  },
});
