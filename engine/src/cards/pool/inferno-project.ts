import { defineCard } from "../define.js";

// EDHREC rank 22258.

export default defineCard({
  name: "Inferno Project",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: "Trample\nThis creature enters with X +1/+1 counters on it, where X is the total mana value of instant and sorcery cards in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            aggregate: "sum",
            of: "mana-value",
            filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" },
            in: "graveyards",
          },
        },
      },
      text: "This creature enters with X +1/+1 counters on it, where X is the total mana value of instant and sorcery cards in your graveyard.",
    },
  ],
});
