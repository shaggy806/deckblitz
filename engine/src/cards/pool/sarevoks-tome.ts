import { defineCard } from "../define.js";

// EDHREC rank 5972.

export default defineCard({
  name: "Sarevok's Tome",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: "When this artifact enters, you take the initiative.\n{T}: Add {C}. If you have the initiative, add {C}{C} instead.\n{3}, {T}: Exile cards from the top of your library until you exile a nonland card. You may cast that card without paying its mana cost. Activate only if you've completed a dungeon.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: { ifCondition: { kind: "initiative", who: "you" }, then: 2, else: 1 },
      },
      resolve: null,
      text: "{T}: Add {C}. If you have the initiative, add {C}{C} instead.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      condition: { kind: "completed-dungeon" },
      // The cards exiled stay exiled, the one not cast too.
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        exile: true,
        rest: "stay",
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: "{3}, {T}: Exile cards from the top of your library until you exile a nonland card. You may cast that card without paying its mana cost. Activate only if you've completed a dungeon.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this artifact enters, you take the initiative.",
    },
  ],
});
