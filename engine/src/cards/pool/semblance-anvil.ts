import { defineCard } from "../define.js";

// Rulings: the reduction is mandatory, only generic, and once however many card
// types are shared.
const IMPRINT_TEXT = "Imprint — When this artifact enters, you may exile a nonland card from your hand.";
const COST_TEXT = "Spells you cast that share a card type with the exiled card cost {2} less to cast.";

export default defineCard({
  name: "Semblance Anvil",
  manaCost: "{3}",
  types: ["artifact"],
  text: `${IMPRINT_TEXT}\n${COST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "exile",
        leftover: "stay",
        filter: { notTypes: ["land"] },
      },
      resolve: null,
      text: IMPRINT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { sharesCardTypeWith: "exiled-with-source" },
        reduceGeneric: 2,
        when: { caster: "you" },
      },
      text: COST_TEXT,
    },
  ],
});
