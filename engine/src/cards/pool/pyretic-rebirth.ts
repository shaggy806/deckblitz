import { defineCard } from "../define.js";

// EDHREC rank 13382.
//
// Rulings:
//   [2024-06-07] If the target creature or planeswalker is an illegal target when Pyretic Rebirth
//     tries to resolve, you'll still return the target artifact or creature card from your
//     graveyard to your hand.
//   [2024-06-07] If the target card in your graveyard is an illegal target when Pyretic Rebirth
//     tries to resolve, no damage will be dealt.
//
// Lie in Wait's shape: "that card's mana value" is the returned card's, and
// an illegal graveyard target has none, so no damage is dealt (rule 608.2b).
const TEXT =
  "Return target artifact or creature card from your graveyard to your hand. Pyretic Rebirth deals damage equal to that card's mana value to up to one target creature or planeswalker.";

export default defineCard({
  name: "Pyretic Rebirth",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: TEXT,
  targets: [
    { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } },
    { kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "damage", amount: { manaValueOf: 0 }, target: 1 },
    ],
  },
});
