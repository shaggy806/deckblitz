import { defineCard } from "../define.js";

// EDHREC rank 14590.
// Makes Fungus → use "Fungus Token (Can't Block)".
//
// Rulings:
//   [2023-11-10] Some cards refer to a player who has "descended this turn." This means that a
//     permanent card has been put into that player's graveyard from anywhere this turn.
//   [2023-11-10] Abilities that begin with "At the beginning of your end step, if you descended
//     this turn" will trigger only once during your end step, no matter how many times you
//     descended this turn. However, if you haven't descended this turn as your end step begins,
//     the ability won't trigger at all. It's not possible to put a permanent card into your
//     graveyard during the end step in time to have the ability trigger.
//   [2023-11-10] Some cards refer to the number of times a player descended this turn. Those cards
//     care about the number of permanent cards put into that player's graveyard from anywhere this
//     turn.
//   [2023-11-10] A permanent card is an artifact, battle, creature, enchantment, land, or
//     planeswalker card. Tokens are not cards, and while tokens are put into the graveyard before
//     ceasing to exist, that action doesn't count as a player having descended.
//   [2023-11-10] In either case, it doesn't matter if those cards are still in that player's
//     graveyard.
//   [2023-11-10] Multiple cards have abilities that begin with "At the beginning of your end step,
//     if you descended this turn." These cards don't need to have been under your control at the
//     time you descended. For example, if a permanent card is put into your graveyard during your
//     first main phase and you cast Stalactite Stalker your second main phase, its ability will
//     trigger at the beginning of your end step.

export default defineCard({
  name: "Broodrage Mycoid",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 4,
  toughness: 3,
  text: "At the beginning of your end step, if you descended this turn, create a 1/1 black Fungus creature token with \"This token can't block.\" (You descended if a permanent card was put into your graveyard from anywhere.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "descended" },
      targets: [],
      effect: { kind: "create-token", token: "Fungus Token (Can't Block)", count: 1 },
      resolve: null,
      text: "At the beginning of your end step, if you descended this turn, create a 1/1 black Fungus creature token with \"This token can't block.\"",
    },
  ],
});
