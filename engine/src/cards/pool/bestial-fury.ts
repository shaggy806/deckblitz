import { defineCard } from "../define.js";

export default defineCard({
  name: "Bestial Fury",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, draw a card at the beginning of the next turn's upkeep.\nWhenever enchanted creature becomes blocked, it gets +4/+0 and gains trample until end of turn.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
      resolve: null,
      text: "When this Aura enters, draw a card at the beginning of the next turn's upkeep.",
    },
    {
      trigger: { on: "becomes-blocked", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 4, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever enchanted creature becomes blocked, it gets +4/+0 and gains trample until end of turn.",
    },
  ],
});
