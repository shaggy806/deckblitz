import { defineCard } from "../define.js";

// Dissension. EDHREC rank 25340.
//
// Balduvian Horde's "sacrifice it unless you discard" shape: with fewer than
// two cards in hand the two can't be discarded, so it's sacrificed unasked.

const TEXT = "When this creature enters, sacrifice it unless you discard two cards.";

export default defineCard({
  name: "Avatar of Discord",
  manaCost: "{B/R}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `({B/R} can be paid with either {B} or {R}.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "hand-size", atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Discard two cards to keep Avatar of Discord?",
          effect: { kind: "discard", target: "you", amount: 2 },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
