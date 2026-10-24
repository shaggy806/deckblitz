import { defineCard } from "../define.js";

const REGEN_TEXT = "{1}{B}: Regenerate this creature. Activate only if you control another colorless creature.";

export default defineCard({
  name: "Skitterskin",
  manaCost: "{3}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 4,
  toughness: 3,
  text: `Devoid (This card has no color.)\nThis creature can't block.\n${REGEN_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This creature can't block." }],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      // Whatever Skitterskin's own colour (the ruling): another colorless creature.
      condition: { kind: "controls", filter: { type: "creature", colorless: true }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
});
