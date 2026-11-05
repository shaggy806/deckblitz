import { defineCard } from "../define.js";

// Syr Elenora's power is a characteristic-defining ability, in every zone
// (the ruling).

export default defineCard({
  name: "Syr Elenora, the Discerning",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 0,
  toughness: 4,
  text: "Syr Elenora's power is equal to the number of cards in your hand.\nWhen Syr Elenora enters, draw a card.\nSpells your opponents cast that target Syr Elenora cost {2} more to cast.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When Syr Elenora enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0, only: "power" },
      text: "Syr Elenora's power is equal to the number of cards in your hand.",
    },
    {
      affects: { scope: "self" },
      targetedBySpellsCost: { payGeneric: 2 },
      text: "Spells your opponents cast that target Syr Elenora cost {2} more to cast.",
    },
  ],
});
