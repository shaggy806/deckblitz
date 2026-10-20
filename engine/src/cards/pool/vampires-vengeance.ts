import { defineCard } from "../define.js";

// EDHREC rank 9573. Breath Weapon's shape, then a Blood token.
export default defineCard({
  name: "Vampires' Vengeance",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Vampires' Vengeance deals 2 damage to each non-Vampire creature. Create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", filter: { type: "creature", notSubtypes: ["Vampire"] }, amount: 2 },
      { kind: "create-token", token: "Blood Token", count: 1 },
    ],
  },
});
