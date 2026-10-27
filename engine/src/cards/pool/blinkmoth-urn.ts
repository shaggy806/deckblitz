import { defineCard } from "../define.js";

// EDHREC rank 5869. Eladamri's Vineyard's each-player first-main trigger:
// "that player" is the active player, who adds the mana, one {C} for each
// artifact they control (counted as it resolves). "If this artifact is
// untapped" is an intervening-if (rule 603.4), checked as it triggers and
// again as it resolves.
//
// Rulings:
//   [2004-10-04] The precombat main phase is the first main phase of the turn.

const TEXT =
  "At the beginning of each player's first main phase, if this artifact is untapped, that player adds {C} for each artifact they control.";

export default defineCard({
  name: "Blinkmoth Urn",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "any" },
      condition: { kind: "source", filter: { tapped: false } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: { countOf: { type: "artifact", controlledBy: "active-player" } },
        who: "active-player",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
