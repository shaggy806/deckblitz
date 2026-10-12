import { defineCard } from "../define.js";

export default defineCard({
  name: "Serra Paladin",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.\n{1}{W}{W}, {T}: Target creature gains vigilance until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
    {
      cost: { mana: "{1}{W}{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}{W}, {T}: Target creature gains vigilance until end of turn.",
    },
  ],
});
