import { defineCard } from "../define.js";

// EDHREC rank 28913.
//
// Rulings:
//   Death-Mask Duplicant gains all landwalk and protection abilities of the imprinted creature
//   cards. If Death-Mask Duplicant imprints a card with protection from red and a card with
//   protection from creatures, it has protection from red and from creatures.
//   This ability can be activated any number of times, so multiple creature cards can become
//   imprinted on this creature.
//
// The imprinted cards are exiled with it (`linked`, rule 607.2a); it has each listed keyword one
// of them has (`sharesKeywords`), their protection abilities (702.16a) and their landwalk
// abilities (702.14a), named or not.

const IMPRINT_TEXT = "Imprint — {1}: Exile target creature card from your graveyard.";
const KEYWORDS_TEXT =
  "As long as a card exiled with this creature has flying, this creature has flying. The same is true for fear, first strike, double strike, haste, landwalk, protection, and trample.";

export default defineCard({
  name: "Death-Mask Duplicant",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 5,
  toughness: 5,
  text: `${IMPRINT_TEXT}\n${KEYWORDS_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: IMPRINT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      sharesKeywords: {
        from: "exiled-with-source",
        keywords: ["flying", "fear", "first-strike", "double-strike", "haste", "trample"],
        protection: true,
        landwalk: true,
      },
      text: KEYWORDS_TEXT,
    },
  ],
});
