import { defineCard } from "../define.js";

export default defineCard({
  name: "Stalking Assassin",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 1,
  text: "{3}{U}, {T}: Tap target creature.\n{3}{B}, {T}: Destroy target tapped creature.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{3}{U}, {T}: Tap target creature.",
    },
    {
      cost: { mana: "{3}{B}", tap: true },
      targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{3}{B}, {T}: Destroy target tapped creature.",
    },
  ],
});
