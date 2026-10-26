import { defineCard } from "../define.js";

export default defineCard({
  name: "Femeref Enchantress",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 2,
  text: "Whenever an enchantment is put into a graveyard from the battlefield, draw a card.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever an enchantment is put into a graveyard from the battlefield, draw a card.",
    },
  ],
});
