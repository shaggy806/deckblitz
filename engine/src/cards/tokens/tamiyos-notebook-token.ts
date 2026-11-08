import { defineCard } from "../define.js";

// Tamiyo, Compleated Sage's Tamiyo's Notebook token.

export default defineCard({
  name: "Tamiyo's Notebook Token",
  tokenName: "Tamiyo's Notebook",
  art: "992cb1e0-e846-4710-b49e-a748e4ebffa5",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: "Spells you cast cost {2} less to cast.\n{T}: Draw a card.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, reduceGeneric: 2, when: { caster: "you" } },
      text: "Spells you cast cost {2} less to cast.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}: Draw a card.",
    },
  ],
});
