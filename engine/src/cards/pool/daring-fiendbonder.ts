import { defineCard } from "../define.js";

export default defineCard({
  name: "Daring Fiendbonder",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 5,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nThis creature attacks each combat if able.\n{1}{B}, Exile this card from your graveyard: Put an indestructible counter on target creature. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "indestructible", amount: 1 },
      resolve: null,
      text: "{1}{B}, Exile this card from your graveyard: Put an indestructible counter on target creature. Activate only as a sorcery.",
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
