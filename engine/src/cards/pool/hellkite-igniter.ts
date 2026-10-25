import { defineCard } from "../define.js";

// X is counted as the ability resolves (the ruling).
const PUMP_TEXT =
  "{1}{R}: This creature gets +X/+0 until end of turn, where X is the number of artifacts you control.";

export default defineCard({
  name: "Hellkite Igniter",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "artifact", controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
