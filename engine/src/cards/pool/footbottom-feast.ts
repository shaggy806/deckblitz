import { defineCard } from "../define.js";

// The cards go on top one at a time in the order they were targeted, so the
// caster orders them (the ruling); cast with no targets, it still draws.
export default defineCard({
  name: "Footbottom Feast",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put any number of target creature cards from your graveyard on top of your library.\nDraw a card.",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "put-on-library", target: 0, position: "top" } },
      { kind: "draw", amount: 1 },
    ],
  },
});
