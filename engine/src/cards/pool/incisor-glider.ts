import { defineCard } from "../define.js";

// Corrupted as an intervening "if" — the trigger's `condition`, checked as
// it triggers and again on resolution (Contaminant Grafter's).

const ATTACK_TEXT =
  "Corrupted — Whenever this creature attacks, if an opponent has three or more poison counters, creatures you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Incisor Glider",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
