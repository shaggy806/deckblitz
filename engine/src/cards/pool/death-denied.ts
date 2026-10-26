import { defineCard } from "../define.js";

// EDHREC rank 11564. Wildest Dreams' exactly-X graveyard targets, creature
// cards only, returned as one event.
export default defineCard({
  name: "Death Denied",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Return X target creature cards from your graveyard to your hand.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  },
});
