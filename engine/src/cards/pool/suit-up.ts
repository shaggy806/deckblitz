import { defineCard } from "../define.js";

// EDHREC rank 19431.
//
// Rulings:
//   [2022-02-18] Suit Up will overwrite any previous effects that set the creature or Vehicle's
//     power and toughness to specific numbers. Effects that otherwise modify its power and
//     toughness will still apply no matter when they took effect. The same is true for +1/+1
//     counters.
//   [2022-02-18] If Suit Up causes a Vehicle to become an artifact creature, it doesn't count as
//     "crewing" that Vehicle for any ability that would trigger off of a Vehicle becoming crewed.
//
// Mind Transfer Protocol's animate, over "creature or Vehicle".

export default defineCard({
  name: "Suit Up",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target creature or Vehicle becomes an artifact creature with base power and toughness 4/5.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 5,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        keywords: [],
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
