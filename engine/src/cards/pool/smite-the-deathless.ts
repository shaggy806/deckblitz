import { defineCard } from "../define.js";

// EDHREC rank 10050.
//
// Rulings:
//   [2023-06-16] You can target a creature that doesn't have indestructible with Smite the
//     Deathless. It will still be exiled if it would die this turn.
//   [2023-06-16] If Smite the Deathless doesn't deal damage to the target creature (perhaps
//     because that damage was prevented), the additional effects will still apply.
//   [2023-06-16] The damaged creature will be exiled if it would die for any reason that turn,
//     not just if it dies due to damage from Smite the Deathless.

export default defineCard({
  name: "Smite the Deathless",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Smite the Deathless deals 3 damage to target creature. That creature loses indestructible until end of turn. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "lose-keywords", target: 0, keywords: ["indestructible"], duration: "end-of-turn" },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
