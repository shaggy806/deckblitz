import { defineCard } from "../define.js";

// `abilityCostModification`'s `firstEachTurn` with a reducing `targeting`, and
// `becomes-target`'s `abilityOnly: "activated"`.
const DISCOUNT_TEXT =
  "The first activated ability you activate during your turn that targets a creature you control " +
  "costs {2} less to activate.";
const DRAW_TEXT =
  "Whenever one or more creatures you control become the target of an activated ability, draw a card. " +
  "This ability triggers only once each turn.";

export default defineCard({
  name: "Professor Hojo",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 2,
  toughness: 2,
  text: `${DISCOUNT_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      abilityCostModification: {
        applies: {},
        anyZone: true,
        byYou: true,
        targeting: { type: "creature", controlledBy: "you" },
        reduceGeneric: 2,
        firstEachTurn: true,
      },
      text: DISCOUNT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "becomes-target",
        who: "you-control",
        filter: { type: "creature" },
        abilityOnly: "activated",
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      oncePerTurn: true,
      text: DRAW_TEXT,
    },
  ],
});
