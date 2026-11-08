import { defineCard } from "../define.js";

const SHADOW_TEXT = "This creature can block creatures with shadow as though they didn't have shadow.";
const PUMP_TEXT = "{R}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Aetherflame Wall",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\n" + SHADOW_TEXT + "\n" + PUMP_TEXT,
  static: [{ affects: { scope: "self" }, blocksAsThoughShadow: true, text: SHADOW_TEXT }],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
