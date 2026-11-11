import { defineCard } from "../define.js";

// EDHREC rank 6742.
//
// Rulings:
//   [2019-08-23] Once the enchanted player has drawn one or more cards, they'll still lose life
//     (and you'll still gain life) even if Curse of Fool's Wisdom leaves the battlefield before
//     its triggered ability resolves.
//
// "Enchanted player" is a `draws` trigger's `who: "attached"` (the player this Aura is attached
// to as the card was drawn), once per card drawn; "they" is who drew, `"trigger-controller"`.

const TEXT = "Whenever enchanted player draws a card, they lose 2 life and you gain 2 life.";

export default defineCard({
  name: "Curse of Fool's Wisdom",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  madness: { cost: "{3}{B}" },
  text: `Enchant player\n${TEXT}\nMadness {3}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "draws", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "trigger-controller" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
