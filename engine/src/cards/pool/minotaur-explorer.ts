import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 30557. Balduvian Horde's shape: with no card in hand
// the discard can't be done, so it's sacrificed unasked.

const TEXT = "When this creature enters, sacrifice it unless you discard a card at random.";

export default defineCard({
  name: "Minotaur Explorer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Scout"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "hand-size", atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Discard a card at random to keep Minotaur Explorer?",
          effect: { kind: "discard", target: "you", amount: 1, random: true },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
