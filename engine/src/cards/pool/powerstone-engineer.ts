import { defineCard } from "../define.js";

export default defineCard({
  name: "Powerstone Engineer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, create a tapped Powerstone token. (It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: "When this creature dies, create a tapped Powerstone token.",
    },
  ],
});
