import { defineCard } from "../define.js";

// EDHREC rank 31137.
//
// Balduvian Horde's "sacrifice it unless you discard a card at random": a
// `may` with `else`, chosen on resolution; with no card in hand the discard
// can't be done, so it's sacrificed unasked.

const TEXT = "When this creature enters, sacrifice it unless you discard a card at random.";

export default defineCard({
  name: "Pillaging Horde",
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
          prompt: "Discard a card at random to keep Pillaging Horde?",
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
