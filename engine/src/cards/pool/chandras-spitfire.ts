import { defineCard } from "../define.js";

// EDHREC rank 13345. Magic 2011. Once per opponent dealt noncombat damage in
// an event, whatever the amount (the rulings) — Wildfire Elemental's trigger.
const TEXT = "Whenever an opponent is dealt noncombat damage, this creature gets +3/+0 until end of turn.";

export default defineCard({
  name: "Chandra's Spitfire",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "opponent", combat: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
