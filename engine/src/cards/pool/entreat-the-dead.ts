import { defineCard } from "../define.js";

// EDHREC rank 14644.

export default defineCard({
  name: "Entreat the Dead",
  manaCost: "{X}{X}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  miracle: { cost: "{X}{B}{B}" },
  text: "Return X target creature cards from your graveyard to the battlefield.\nMiracle {X}{B}{B} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  targets: [
    { kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, min: "x", max: "x" },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "put-onto-battlefield", target: 0 },
  },
});
