import { defineCard } from "../define.js";

// EDHREC rank 9472.
//
// Rulings:
//   To determine how many cards to exile, use the enchanted creature's power
//   as it last existed on the battlefield.
//   If Dead Man's Chest enchants a creature that you own but an opponent
//   controls, you'll exile cards from your library.
//   If Dead Man's Chest and the enchanted creature are put into graveyards at
//   the same time, the last ability still triggers.
//
// Nurgle's Rot's dies trigger; the exile is from the dead creature's owner's
// library, and casting them lasts while they stay exiled, with mana of any
// type (Petty Larceny's permission, cast only).

const DIES_TEXT =
  "When enchanted creature dies, exile cards equal to its power from the top of its owner's library. You may cast spells from among those cards for as long as they remain exiled, and mana of any type can be spent to cast them.";

export default defineCard({
  name: "Dead Man's Chest",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature an opponent controls\n${DIES_TEXT}`,
  targets: ["creature-an-opponent-controls"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: { powerOf: "trigger-object" },
        whose: { ownerOf: "trigger-object" },
        duration: "while-exiled",
        spendAs: "any-type",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
