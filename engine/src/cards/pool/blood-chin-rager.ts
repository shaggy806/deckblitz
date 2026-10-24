import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature attacks, Warrior creatures you control gain menace until end of turn. (They can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Blood-Chin Rager",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", subtype: "Warrior", controlledBy: "you" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
