import { defineCard } from "../define.js";

const ARTIFACTS_X2 = { countOf: { type: "artifact", controlledBy: "you" }, times: 2 } as const;

export default defineCard({
  name: "Tezzeret, Agent of Bolas",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tezzeret"],
  loyalty: 3,
  text: "+1: Look at the top five cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in any order.\n−1: Target artifact becomes an artifact creature with base power and toughness 5/5.\n−4: Target player loses X life and you gain X life, where X is twice the number of artifacts you control.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: "+1: Look at the top five cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["artifact"],
      effect: {
        kind: "animate",
        target: 0,
        power: 5,
        toughness: 5,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "permanent",
      },
      resolve: null,
      text: "−1: Target artifact becomes an artifact creature with base power and toughness 5/5.",
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: ARTIFACTS_X2, target: 0 },
          { kind: "gain-life", amount: ARTIFACTS_X2 },
        ],
      },
      resolve: null,
      text: "−4: Target player loses X life and you gain X life, where X is twice the number of artifacts you control.",
    },
  ],
});
