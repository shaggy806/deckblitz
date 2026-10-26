import { defineCard } from "../define.js";

export default defineCard({
  name: "Flinthoof Boar",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 2,
  toughness: 2,
  text: "This creature gets +1/+1 as long as you control a Mountain.\n{R}: This creature gains haste until end of turn. (It can attack and {T} this turn.)",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gains haste until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Mountain" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control a Mountain.",
    },
  ],
});
