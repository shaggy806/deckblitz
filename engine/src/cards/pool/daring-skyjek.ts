import { defineCard } from "../define.js";

// EDHREC rank 26518. Boros Mastiff's battalion trigger.

const TEXT =
  "Battalion — Whenever this creature and at least two other creatures attack, this creature gains flying until end of turn.";

export default defineCard({
  name: "Daring Skyjek",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
