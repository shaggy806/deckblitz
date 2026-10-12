import { defineCard } from "../define.js";

export default defineCard({
  name: "Jhessian Balmgiver",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.\n{T}: Target creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature can't be blocked this turn.",
    },
  ],
});
