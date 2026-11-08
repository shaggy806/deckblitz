import { defineCard } from "../define.js";

const LOCK = "Players can't activate planeswalkers' loyalty abilities.";
const DRAW = "At the beginning of your draw step, draw an additional card.";
const COST = "Spells you cast cost {1} less to cast.";
const ANTHEM = "Creatures you control get +1/+1.";

export default defineCard({
  name: "The Immortal Sun",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${LOCK}\n${DRAW}\n${COST}\n${ANTHEM}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", abilitiesOf: { type: "planeswalker" }, onlyLoyaltyAbilities: true },
      text: LOCK,
    },
    { affects: { scope: "self" }, costModification: { applies: {}, reduceGeneric: 1, when: { caster: "you" } }, text: COST },
    { affects: { scope: "creatures-you-control" }, grantPt: [1, 1], text: ANTHEM },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
});
