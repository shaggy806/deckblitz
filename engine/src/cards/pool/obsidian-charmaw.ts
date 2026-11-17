import { defineCard } from "../define.js";

// EDHREC rank 11270.
// "Could produce {C}" (rule 106.7) is the `couldProduce` filter clause: any
// of the land's mana abilities would make {C} if it resolved now, whether or
// not it could be activated.
//
// Rulings:
//   Obsidian Charmaw's first ability counts each land your opponents control that would produce
//     {C} if one of that land's abilities resolved. It doesn't matter whether that land's
//     controller could currently activate the ability or not.

export default defineCard({
  name: "Obsidian Charmaw",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "This spell costs {1} less to cast for each land your opponents control that could produce {C}.\nFlying\nWhen this creature enters, destroy target nonbasic land an opponent controls.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "land", controlledBy: "opponent", couldProduce: "C" } },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { notSupertype: "basic", type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target nonbasic land an opponent controls.",
    },
  ],
});
