import { defineCard } from "../define.js";

// EDHREC rank 18695.
//
// - The life gain is a leaves-the-graveyard trigger on the card itself, which
//   looks back (rule 603.10a): `fromGraveyard`, `who: "self"`, `to: "hand"` —
//   by dredge, or any other return to hand (Raise Dead, Eternal Witness).
// - Dredge is `CardDefinition.dredge` (Life from the Loam's).
const GAIN_TEXT = "When this card is put into your hand from your graveyard, you gain 2 life.";

export default defineCard({
  name: "Golgari Brownscale",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 3,
  dredge: 2,
  text:
    `${GAIN_TEXT}\n` +
    "Dredge 2 (If you would draw a card, you may mill two cards instead. If you do, return this card from your graveyard to your hand.)",
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "leaves-graveyard", who: "self", to: "hand" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
