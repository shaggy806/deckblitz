import { defineCard } from "../define.js";

// EDHREC rank 18987.
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

const DIES_TEXT = "When this creature dies, create a 1/1 green Elf Warrior creature token.";

export default defineCard({
  name: "Exquisite Huntmaster",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 4,
  toughness: 2,
  text: `${DIES_TEXT}\nEncore {4}{B} ({4}{B}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Elf Warrior Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: "Encore {4}{B} — Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able.",
    },
  ],
});
