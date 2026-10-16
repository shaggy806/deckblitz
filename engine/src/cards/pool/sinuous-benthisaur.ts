import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Stirring Honormancer's "look at the top X"
// with X the Caves you control plus the Cave cards in your graveyard, read
// as it resolves. Two to the hand (all of them when X is 1, nothing looked
// at when X is 0 — the ruling), the rest to the bottom in a random order.

const TEXT =
  "When this creature enters, look at the top X cards of your library, where X is the number of Caves you control plus the number of Cave cards in your graveyard. Put two of those cards into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Sinuous Benthisaur",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: {
          sum: [
            { countOf: { subtype: "Cave", controlledBy: "you" } },
            { countInGraveyard: { subtype: "Cave", ownedBy: "you" } },
          ],
        },
        min: 2,
        max: 2,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
