import { defineCard } from "../define.js";

// EDHREC rank 26096.
//
// Rulings:
//   [2009-10-01] Even though Zodiac Dragon is a Dragon, it doesn't have flying.
//   [2009-10-01] If Zodiac Dragon is removed from the graveyard after the ability triggers but
//     before it resolves, you can't return it to your hand. Similarly, if a replacement effect has
//     Zodiac Dragon move to a different zone instead of being put into the graveyard, the ability
//     won't trigger at all.
//
// "Put into **your** graveyard" — a card goes to its owner's, so the leaving
// Dragon must be one its controller owns (`ownedBy: "you"`, as it last
// existed). The return reads the trigger's card in the graveyard, so a card
// that has left it since isn't returned.
const TEXT = "When this creature is put into your graveyard from the battlefield, you may return it to your hand.";

export default defineCard({
  name: "Zodiac Dragon",
  manaCost: "{7}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 8,
  toughness: 8,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"], filter: { ownedBy: "you" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Zodiac Dragon to your hand?",
        effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
