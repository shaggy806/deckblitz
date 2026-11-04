import { defineCard } from "../define.js";

// Pyre Rhymer's prepare spell (rule 722): no card of its own, only ever cast as
// the copy a prepared Pyre Rhymer makes in exile (722.3c). Only your own
// Mountains, unlike High Tide's every player's Islands.
export default defineCard({
  name: "Molten Tide",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  prepareSpellOnly: true,
  text: "Until end of turn, whenever you tap a Mountain for mana, add an additional {R}.",
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "tapped-for-mana", who: "you-control", filter: { subtype: "Mountain" } } },
    effect: { kind: "add-mana", mana: "R", amount: 1 },
    text: "Whenever you tap a Mountain for mana, add an additional {R}.",
  },
});
