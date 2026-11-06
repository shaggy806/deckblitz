import { defineCard } from "../define.js";

/** The Feroz's Ban token (Feroz, Ulgrotha's Warden): a copy of the card
 * Feroz's Ban — named Feroz's Ban, its {6} mana cost and all. */
const TEXT = "Creature spells cost {2} more to cast.";

export default defineCard({
  name: "Feroz's Ban Token",
  tokenName: "Feroz's Ban",
  art: "188b3863-fa7d-4fbb-b061-97580d394017",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT}\n(This token's mana cost is {6}.)`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature" }, increaseGeneric: 2 },
      text: TEXT,
    },
  ],
});
