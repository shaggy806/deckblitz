import { defineCard } from "../define.js";

export default defineCard({
  name: "Polymorphist's Jest",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, each creature target player controls loses all abilities and becomes a blue Frog with base power and toughness 1/1.",
  targets: ["player"],
  effect: {
    kind: "for-each-permanent",
    filter: { type: "creature", controlledBy: "you" },
    controlledByTarget: 0,
    as: 1,
    simultaneous: true,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "animate", target: 1, power: 1, toughness: 1, addTypes: [], addSubtypes: [], loseAbilities: true, duration: "end-of-turn" },
        { kind: "add-types", target: 1, setSubtypes: ["Frog"], duration: "end-of-turn" },
        { kind: "become-color", target: 1, colors: ["U"], duration: "end-of-turn" },
      ],
    },
  },
});
