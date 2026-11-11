import { defineCard } from "../define.js";

// Rulings:
//   If you own face-down cards in exile, they won't count toward the value of X.
//   Slime Against Humanity isn't put into your graveyard until after it finishes resolving,
//     so it doesn't count itself for its own effect.

export default defineCard({
  name: "Slime Against Humanity",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  deckCopies: "any",
  text: "Create a 0/0 green Ooze creature token with trample. Put X +1/+1 counters on it, where X is two plus the total number of cards you own in exile and in your graveyard that are Oozes or are named Slime Against Humanity.\nA deck can have any number of cards named Slime Against Humanity.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "0/0 Trample Ooze Token",
    count: 1,
    thenCounters: {
      kind: "+1/+1",
      amount: {
        sum: [
          2,
          {
            aggregate: "count",
            filter: { ownedBy: "you", anyOf: [{ subtype: "Ooze" }, { name: "Slime Against Humanity" }] },
            in: ["graveyards", "exile"],
          },
        ],
      },
    },
  },
});
