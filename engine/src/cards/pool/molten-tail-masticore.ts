import { defineCard } from "../define.js";

// EDHREC rank 29875.

const UPKEEP = "At the beginning of your upkeep, sacrifice this creature unless you discard a card.";
const SHOOT = "{4}, Exile a creature card from your graveyard: This creature deals 4 damage to any target.";

export default defineCard({
  name: "Molten-Tail Masticore",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Masticore"],
  power: 4,
  toughness: 4,
  text: `${UPKEEP}\n${SHOOT}\n{2}: Regenerate this creature.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ discard: 1, text: "Discard a card" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: SHOOT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}: Regenerate this creature.",
    },
  ],
});
