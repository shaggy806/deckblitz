import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 16569.

export default defineCard({
  name: "Cave-In",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["R"] }, text: "a red card" } },
  text: "You may exile a red card from your hand rather than pay this spell's mana cost.\nCave-In deals 2 damage to each creature and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 2 },
      { kind: "damage", amount: 2, who: "each-player" },
    ],
  },
});
