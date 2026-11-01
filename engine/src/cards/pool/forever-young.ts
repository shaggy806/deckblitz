import { defineCard } from "../define.js";

// Ravnica Allegiance (RNA). The creature cards go on top together, in the
// order their owner (the caster) chooses (rule 401.4), and the draw takes
// the one put on top.

export default defineCard({
  name: "Forever Young",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Put any number of target creature cards from your graveyard on top of your library.\nDraw a card.",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "top" },
      { kind: "draw", amount: 1 },
    ],
  },
});
