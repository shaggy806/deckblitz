import { defineCard } from "../define.js";

// EDHREC rank 22740.
//
// Rulings:
//   [2020-11-10] Each token must attack the appropriate player if able.
//   [2020-11-10] Opponents who have left the game aren't counted when determining how many tokens
//     to create.
//   [2020-11-10] The tokens copy only what's on the original card.
//   [2020-11-10] Exiling the card with encore is a cost to activate the ability.
//
// Encore is Mist Dancer's shape: a graveyard ability whose cost exiles the
// card, then the `encore` effect.

const DIES_TEXT = "When this creature dies, draw a card.";

export default defineCard({
  name: "Trove Tracker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: `${DIES_TEXT}\nEncore {5}{U}{U} ({5}{U}{U}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{U}{U}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: "Encore {5}{U}{U} — Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able.",
    },
  ],
});
