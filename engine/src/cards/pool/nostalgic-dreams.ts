import { defineCard } from "../define.js";

// EDHREC rank 16737. Torment.

export default defineCard({
  name: "Nostalgic Dreams",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard X cards.\nReturn X target cards from your graveyard to your hand. Exile Nostalgic Dreams.",
  additionalCost: { discard: "x" },
  // Targets are chosen before the cost is paid (rule 601.2c, 601.2h), so the
  // cards discarded for it can't be among them.
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: {} }, min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  },
  exileOnResolve: true,
});
