import { defineCard } from "../define.js";

export default defineCard({
  name: "Blink Dog",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: "Double strike\nTeleport — {3}{W}: This creature phases out. (Treat it and anything attached to it as though they don't exist until your next turn.)",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: { kind: "phase-out", target: "source" },
      resolve: null,
      text: "Teleport — {3}{W}: This creature phases out.",
    },
  ],
});
