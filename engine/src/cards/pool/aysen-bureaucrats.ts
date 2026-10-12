import { defineCard } from "../define.js";

export default defineCard({
  name: "Aysen Bureaucrats",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 1,
  text: "{T}: Tap target creature with power 2 or less.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{T}: Tap target creature with power 2 or less.",
    },
  ],
});
