import { defineCard } from "../define.js";

// EDHREC rank 19386.
//
// "One or more opponents are dealt noncombat damage" is a batched damage
// trigger, once per simultaneous damage event however many opponents it hit
// (`once: "per-event"`), from any source — an opponent's own, too.

const PUMP_TEXT =
  "Whenever one or more opponents are dealt noncombat damage, creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Master of Barbs",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Bard"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "opponent", combat: false, once: "per-event" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
