import { defineCard } from "../define.js";

// EDHREC rank 23658.
//
// Rulings:
//   [2019-10-04] A creature with an Adventure you control that would enter the battlefield with no
//     +1/+1 counters on it enters with one +1/+1 counter on it.
//   [2019-10-04] An effect may refer to a card, spell, or permanent that "has an Adventure." This
//     refers to a card, spell, or permanent that has an adventurer card's set of alternative
//     characteristics, even if they're not being used and even if that card was never cast as an
//     Adventure.
//
// Renata, Called to the Hunt's replacement, narrowed by `hasAdventure`; a
// face-down creature has no Adventure (rule 708.2).

const TEXT =
  "Each creature you control that has an Adventure enters with an additional +1/+1 counter on it. (It doesn't need to have gone on the adventure first.)";

export default defineCard({
  name: "Mysterious Pathlighter",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you", hasAdventure: true, faceDown: false },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: TEXT,
    },
  ],
});
