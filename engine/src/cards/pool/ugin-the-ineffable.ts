import { defineCard } from "../define.js";

const COST = "Colorless spells you cast cost {2} less to cast.";
const PLUS =
  "+1: Exile the top card of your library face down and look at it. Create a 2/2 colorless Spirit creature token. When that token leaves the battlefield, put the exiled card into your hand.";
const MINUS = "−3: Destroy target permanent that's one or more colors.";

export default defineCard({
  name: "Ugin, the Ineffable",
  manaCost: "{6}",
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ugin"],
  loyalty: 4,
  text: `${COST}\n${PLUS}\n${MINUS}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colorless: true }, caster: "you", reduceGeneric: 2 },
      text: COST,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 1, faceDown: "looked", linked: true },
          { kind: "create-token", token: "Spirit Token (Ugin, the Ineffable)", count: 1 },
          {
            kind: "delayed-trigger",
            at: { leaves: "created", to: ["graveyard", "exile", "hand", "library", "command"] },
            about: "exiled",
            effect: { kind: "return-to-hand", target: 0, from: "exile" },
            text: "When that token leaves the battlefield, put the exiled card into your hand.",
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }] },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: MINUS,
    },
  ],
});
