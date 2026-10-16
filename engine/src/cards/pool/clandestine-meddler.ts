import { defineCard } from "../define.js";

// "Whenever one or more suspected creatures you control attack" fires once
// per attack declaration that includes at least one suspected creature.

const SUSPECT_TEXT = "When this creature enters, suspect up to one other target creature you control.";
const ATTACK_TEXT = "Whenever one or more suspected creatures you control attack, surveil 1.";

export default defineCard({
  name: "Clandestine Meddler",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, suspect up to one other target creature you control. (A suspected creature has menace and can't block.)\nWhenever one or more suspected creatures you control attack, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: { kind: "suspect", target: 0 },
      resolve: null,
      text: SUSPECT_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { type: "creature", suspected: true } },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
