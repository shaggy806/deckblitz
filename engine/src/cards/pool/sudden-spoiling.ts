import { defineCard } from "../define.js";

export default defineCard({
  name: "Sudden Spoiling",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  splitSecond: true,
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nUntil end of turn, creatures target player controls lose all abilities and have base power and toughness 0/2.",
  targets: ["player"],
  effect: {
    kind: "become",
    filter: { type: "creature", controlledBy: "you" },
    controlledByTarget: 0,
    loseAbilities: true,
    power: 0,
    toughness: 2,
    duration: "end-of-turn",
  },
});
