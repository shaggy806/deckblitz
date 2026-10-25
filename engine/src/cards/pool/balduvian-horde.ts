import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 29023.
//
// Rulings:
//   [2004-10-04] You choose whether to discard or not on resolution. If not, then you sacrifice
//     this card. You can choose to not discard even if you no longer control this card on
//     resolution.
//
// The Gitrog Monster's "sacrifice ~ unless you …" framed as a `may` with
// `else`. With no card in hand the discard can't be done, so it's sacrificed
// unasked.

const TEXT = "When this creature enters, sacrifice it unless you discard a card at random.";

export default defineCard({
  name: "Balduvian Horde",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 5,
  toughness: 5,
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
          prompt: "Discard a card at random to keep Balduvian Horde?",
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
