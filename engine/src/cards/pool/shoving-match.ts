import { defineCard } from "../define.js";

export default defineCard({
  name: "Shoving Match",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: 'Until end of turn, all creatures gain "{T}: Tap target creature."',
  targets: [],
  effect: {
    kind: "grant-activated-all",
    filter: { type: "creature" },
    ability: {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{T}: Tap target creature.",
    },
    duration: "end-of-turn",
  },
});
