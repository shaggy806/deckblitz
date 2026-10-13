import { defineCard } from "../define.js";

// EDHREC rank 7764.

const LEAVE_TEXT = "Whenever one or more artifact and/or creature cards leave your graveyard, you gain 1 life.";
const ETB_TEXT =
  "When this enchantment enters, mill four cards. You may put an artifact, creature, or land card from among the milled cards into your hand.";

export default defineCard({
  name: "Dredger's Insight",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${LEAVE_TEXT}\n${ETB_TEXT} (To mill four cards, put the top four cards of your library into your graveyard.)`,
  triggered: [
    {
      // Thran Vigil's batched trigger, without its "during your turn".
      trigger: { on: "leaves-graveyard", who: "you", filter: { typesAnyOf: ["artifact", "creature"] } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: LEAVE_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", typesAnyOf: ["artifact", "creature", "land"] },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
