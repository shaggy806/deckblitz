import { defineCard } from "../define.js";

// EDHREC rank 30800.

export default defineCard({
  name: "Skirk Volcanist",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 1,
  morph: {
    keyword: "morph",
    cost: "",
    also: { sacrifice: { filter: { subtype: "Mountain" }, count: 2 } },
    text: "Sacrifice two Mountains",
  },
  text: "Morph—Sacrifice two Mountains. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, it deals 3 damage divided as you choose among one, two, or three target creatures.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature" } }, min: 1, max: 3 }],
      divided: { total: 3, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: "When this creature is turned face up, it deals 3 damage divided as you choose among one, two, or three target creatures.",
    },
  ],
});
