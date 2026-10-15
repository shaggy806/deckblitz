import { defineCard } from "../define.js";

// EDHREC rank 24578.
// Battalion is part of the trigger condition, not an intervening if (Sokka,
// Lateral Strategist's `whileCondition`): three or more attacking creatures
// as Ross attacks — him and at least two others, all declared together.
// "Attacking creatures" is every attacking creature as it resolves.

const BATTALION_TEXT =
  "Battalion — Whenever General Thunderbolt Ross and at least two other creatures attack, attacking creatures get +1/+0 until end of turn.";

export default defineCard({
  name: "General Thunderbolt Ross",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${BATTALION_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: BATTALION_TEXT,
    },
  ],
});
