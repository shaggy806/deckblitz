import { defineCard } from "../define.js";

// EDHREC rank 25169. Boros Mastiff's battalion trigger.

const TEXT =
  "Battalion — Whenever this creature and at least two other creatures attack, this creature gains first strike until end of turn.";

export default defineCard({
  name: "Wojek Halberdiers",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
