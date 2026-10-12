import { defineCard } from "../define.js";

export default defineCard({
  name: "Rakeclaw Gargantuan",
  manaCost: "{2}{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 3,
  text: "{1}: Target creature with power 5 or greater gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 5 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: "{1}: Target creature with power 5 or greater gains first strike until end of turn.",
    },
  ],
});
