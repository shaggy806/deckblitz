import { defineCard } from "../define.js";

// EDHREC rank 17090.
const HASTE_TEXT = "Minotaur creatures you control have haste.";
const ATTACK_TEXT = "Whenever a Minotaur you control attacks, it gets +2/+0 until end of turn.";

export default defineCard({
  name: "Kragma Warcaller",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 2,
  toughness: 3,
  text: `${HASTE_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Minotaur", controlledBy: "you" } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Minotaur" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
