import { defineCard } from "../define.js";

// EDHREC rank 28881.

const TEXT =
  "During your main phase, each card in your graveyard has beam me up. The beam me up cost is equal to that spell's mana cost. Scotty can't be beamed up to cast a spell this way. (Only instant and sorcery spells can be cast this way. You may cast a card from your graveyard for its beam me up cost if you also return another creature you control to its owner's hand. Then exile that spell.)";

// Only an instant or sorcery can be cast this way (the reminder), for its own
// mana cost, returning a creature other than Scotty; exiled as it leaves the
// stack, like any flashback.
export default defineCard({
  name: "Scotty, Miracle Worker",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-main-phase" },
      grantsToGraveyard: {
        filter: { typesAnyOf: ["instant", "sorcery"] },
        flashback: {
          cost: "mana-cost",
          keyword: "beam-me-up",
          returnToHand: { filter: { type: "creature", isSource: false }, count: 1 },
        },
      },
      text: TEXT,
    },
  ],
});
