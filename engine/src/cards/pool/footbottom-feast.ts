import { defineCard } from "../define.js";

// The cards go on top together, in the order the caster (their owner)
// chooses as it resolves (the ruling, rule 401.4 — `put-on-libraries`);
// cast with no targets, it still draws.
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
      { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "top" },
      { kind: "draw", amount: 1 },
    ],
  },
});
