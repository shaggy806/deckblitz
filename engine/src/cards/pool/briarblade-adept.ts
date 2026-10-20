import { defineCard } from "../define.js";

// EDHREC rank 22682.
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

const ATTACK_TEXT = "Whenever this creature attacks, target creature an opponent controls gets -1/-1 until end of turn.";

export default defineCard({
  name: "Briarblade Adept",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Assassin"],
  power: 3,
  toughness: 4,
  text: `${ATTACK_TEXT}\nEncore {3}{B} ({3}{B}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: "Encore {3}{B} — Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able.",
    },
  ],
});
