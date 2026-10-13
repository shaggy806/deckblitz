import { defineCard } from "../define.js";

// EDHREC rank 10690.

const RETURN_TEXT =
  "{2}{B}{G}, {T}, Sacrifice this artifact: Return target creature or Vehicle card from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Broodheart Engine",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["artifact"],
  text: `At the beginning of your upkeep, surveil 1.\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}{G}", tap: true, sacrifice: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, surveil 1.",
    },
  ],
});
