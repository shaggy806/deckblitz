import { defineCard } from "../define.js";

export default defineCard({
  name: "Errant Doomsayers",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 1,
  toughness: 1,
  text: "{T}: Tap target creature with toughness 2 or less.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", toughness: { op: "lte", n: 2 } } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{T}: Tap target creature with toughness 2 or less.",
    },
  ],
});
