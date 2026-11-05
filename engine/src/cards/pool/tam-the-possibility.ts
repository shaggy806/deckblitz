import { defineCard } from "../define.js";

// X is read once, as the ability resolves (the ruling): `repeat`'s `times`.
// Each proliferate asks afresh, with nothing able to happen in between.
const COST_TEXT = "Planeswalker spells you cast cost {1} less to cast.";
const PROLIFERATE_TEXT =
  "{W}{U}{B}{R}{G}, {T}: Proliferate X times, where X is the number of planeswalker types among planeswalkers you control. (To proliferate, choose any number of permanents and/or players, then give each another counter of each kind already there.)";

export default defineCard({
  name: "Tam, the Possibility",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon", "Wizard"],
  power: 2,
  toughness: 4,
  text: `${COST_TEXT}\n${PROLIFERATE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "planeswalker" }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: true },
      targets: [],
      effect: {
        kind: "repeat",
        times: {
          aggregate: "distinct",
          of: { subtypesOf: "planeswalker" },
          filter: { type: "planeswalker", controlledBy: "you" },
        },
        effect: { kind: "proliferate" },
      },
      resolve: null,
      text: PROLIFERATE_TEXT,
    },
  ],
});
