import { defineCard } from "../define.js";

// EDHREC rank 12880.
//
// Rulings:
//   [2023-06-16] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, you can sacrifice Lembas to Pippin's Bravery.
//   [2023-06-16] You choose a target creature as you cast Pippin's Bravery, but you don't choose
//     whether to sacrifice a Food until the spell resolves.
//   [2023-06-16] If the target creature is an illegal target by the time Pippin's Bravery tries to
//     resolve, Pippin's Bravery is removed from the stack. You won't be able to sacrifice a Food
//     to it.
//
// The sacrifice is asked as the spell resolves (`each-player-may` of "you"),
// any Food artifact, token or not.

export default defineCard({
  name: "Pippin's Bravery",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You may sacrifice a Food. If you do, target creature gets +4/+4 until end of turn. Otherwise, that creature gets +2/+2 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "each-player-may",
    who: "you",
    options: [{ sacrifice: { type: "artifact", subtype: "Food" }, text: "Sacrifice a Food" }],
    ifDid: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
    ifDidnt: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  },
});
