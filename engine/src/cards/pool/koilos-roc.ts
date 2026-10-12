import { defineCard } from "../define.js";

export default defineCard({
  name: "Koilos Roc",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, create a tapped Powerstone token. (It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: "When this creature enters, create a tapped Powerstone token.",
    },
  ],
});
