import { defineCard } from "../define.js";

// EDHREC rank 17280. An intervening-if (rule 603.4): checked as it triggers
// and again as it resolves.
const ATTACK_TEXT =
  "Whenever this creature attacks, if you control eight or more lands, creatures you control get +2/+2 until end of turn.";

export default defineCard({
  name: "Kyoshi Warrior Exemplars",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 4,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 8 },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
