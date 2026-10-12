import { defineCard } from "../define.js";

export default defineCard({
  name: "Beacon Behemoth",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 3,
  text: "{1}: Target creature with power 5 or greater gains vigilance until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 5 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      resolve: null,
      text: "{1}: Target creature with power 5 or greater gains vigilance until end of turn.",
    },
  ],
});
