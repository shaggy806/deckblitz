import { defineCard } from "../define.js";

export default defineCard({
  name: "Sarinth Greatwurm",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nWhenever a land enters, create a tapped Powerstone token. (It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: "Whenever a land enters, create a tapped Powerstone token.",
    },
  ],
});
