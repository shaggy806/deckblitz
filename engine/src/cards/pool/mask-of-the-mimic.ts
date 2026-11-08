import { defineCard } from "../define.js";

// The target is only named: the search happens on resolution, and a target
// gone by then leaves the spell with nothing to do (rule 608.2b).

export default defineCard({
  name: "Mask of the Mimic",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice a creature.\nSearch your library for a card with the same name as target nontoken creature, put that card onto the battlefield, then shuffle.",
  additionalCost: { sacrifice: { type: "creature" } },
  targets: [{ kind: "permanent", filter: { type: "creature", token: false } }],
  effect: {
    kind: "search-library",
    filter: { sameNameWith: 0 },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
