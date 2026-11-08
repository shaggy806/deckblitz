import { defineCard } from "../define.js";

// EDHREC rank 7892. "During your turn" is part of the trigger condition
// (`whileCondition`, rule 603.1), not an intervening if.

const METALCRAFT_TEXT = "Metalcraft — {T}: You get {E} (an energy counter). Activate only if you control three or more artifacts.";
const ENERGY_TEXT = "Whenever you get one or more {E} during your turn, creatures you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Brotherhood Scribe",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 3,
  text: `${METALCRAFT_TEXT}\n${ENERGY_TEXT}`,
  activated: [
    {
      cost: { tap: true, mana: null },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      condition: { kind: "metalcraft" },
      resolve: null,
      text: METALCRAFT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-put", who: "you", counter: "energy", orPlayer: true },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ENERGY_TEXT,
    },
  ],
});
