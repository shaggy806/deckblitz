import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 31519.
export default defineCard({
  name: "Dauntless River Marshal",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: "This creature gets +1/+1 as long as you control an Island.\n{3}{U}: Tap target creature.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control an Island.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{3}{U}: Tap target creature.",
    },
  ],
});
