import { defineCard } from "../define.js";

export default defineCard({
  name: "Raka Disciple",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{W}, {T}: Prevent the next 1 damage that would be dealt to any target this turn.\n{U}, {T}: Target creature gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{W}, {T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{U}, {T}: Target creature gains flying until end of turn.",
    },
  ],
});
