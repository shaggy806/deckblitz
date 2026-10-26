import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 25938.
//
// The alternative cost exiles two black cards from hand (Force of Will's
// shape, with `count: 2`); the spell itself is on the stack as costs are paid,
// so it can't pay for itself (the ruling).

export default defineCard({
  name: "Soul Spike",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  alternativeCost: {
    mana: "{0}",
    exileFromHand: { filter: { colors: ["B"] }, count: 2, text: "two black cards" },
  },
  text: "You may exile two black cards from your hand rather than pay this spell's mana cost.\nSoul Spike deals 4 damage to any target and you gain 4 life.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "gain-life", amount: 4 }],
  },
});
