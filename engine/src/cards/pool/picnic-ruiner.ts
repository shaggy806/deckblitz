import { defineCard } from "../define.js";

// EDHREC rank 15698.
//
// "Attacks while you control a creature with power 4 or greater" is part of
// the trigger condition (rule 603.1): checked as it's declared an attacker,
// not again as the ability resolves (the ruling).

const ATTACK_TEXT =
  "Whenever this creature attacks while you control a creature with power 4 or greater, this creature gains double strike until end of turn.";

export default defineCard({
  name: "Picnic Ruiner",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Picnic Ruiner", "Stolen Goodies"],
  adventure: true,
});
