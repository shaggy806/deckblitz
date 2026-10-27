import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 31928. The "no untapped lands" intervening-if
// (rule 603.4): checked as it triggers and again as it resolves.

const TEXT = "Whenever this creature attacks, if you control no untapped lands, it gets +3/+0 until end of turn.";

export default defineCard({
  name: "Keldon Berserker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Berserker"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
