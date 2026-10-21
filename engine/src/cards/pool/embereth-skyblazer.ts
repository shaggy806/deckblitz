import { defineCard } from "../define.js";

const FLYING = "During your turn, this creature has flying.";
const ATTACK =
  "Whenever this creature attacks, you may pay {2}{R}. If you do, creatures you control get +X/+0 until end of turn, where X is the number of opponents you have.";

export default defineCard({
  name: "Embereth Skyblazer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 3,
  text: `${FLYING}\n${ATTACK}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["flying"],
      text: FLYING,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // X is counted as it resolves, opponents still in the game only (its rulings).
      effect: {
        kind: "may",
        prompt: "Pay {2}{R} to give creatures you control +X/+0, where X is the number of opponents you have?",
        cost: "{2}{R}",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: { countPlayers: "each-opponent" },
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
