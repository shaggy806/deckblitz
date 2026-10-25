import { defineCard } from "../define.js";

// EDHREC rank 14428.

const RETURN_TEXT =
  "Delirium — {2}{G}, Sacrifice this enchantment: Return up to one target creature card and up to one target land card from your graveyard to your hand. Activate only if there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Crop Sigil",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `At the beginning of your upkeep, you may mill a card.\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false, sacrifice: "self" },
      condition: { kind: "delirium" },
      targets: [
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "land" } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Mill a card?",
        effect: { kind: "mill", target: "you", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may mill a card.",
    },
  ],
});
