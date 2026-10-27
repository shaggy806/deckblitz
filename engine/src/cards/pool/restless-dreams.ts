import { defineCard } from "../define.js";

// EDHREC rank 18592. Torment.

export default defineCard({
  name: "Restless Dreams",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard X cards.\nReturn X target creature cards from your graveyard to your hand.",
  additionalCost: { discard: "x" },
  targets: [
    { kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, min: "x", max: "x" },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  },
});
