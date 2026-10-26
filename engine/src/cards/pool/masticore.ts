import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 25287.
//
// The upkeep is Bebop & Rocksteady's `unless` you answer yourself: with a
// card in hand you choose to discard one or not; with none it's sacrificed.

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this creature unless you discard a card.";

export default defineCard({
  name: "Masticore",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Masticore"],
  power: 4,
  toughness: 4,
  text: `${UPKEEP_TEXT}\n{2}: This creature deals 1 damage to target creature.\n{2}: Regenerate this creature.`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{2}: This creature deals 1 damage to target creature.",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}: Regenerate this creature.",
    },
  ],
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
      text: UPKEEP_TEXT,
    },
  ],
});
