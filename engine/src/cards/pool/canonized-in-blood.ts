import { defineCard } from "../define.js";

// EDHREC rank 16053.
// Makes Vampire Demon → use "Vampire Demon Token".
//
// Rulings:
//   [2023-11-10] Some cards refer to a player who has "descended this turn." This means that a
//     permanent card has been put into that player's graveyard from anywhere this turn.
//   [2023-11-10] A permanent card is an artifact, battle, creature, enchantment, land, or
//     planeswalker card. Tokens are not cards, and while tokens are put into the graveyard before
//     ceasing to exist, that action doesn't count as a player having descended.
//   [2023-11-10] Some cards refer to the number of times a player descended this turn. Those cards
//     care about the number of permanent cards put into that player's graveyard from anywhere this
//     turn.
//   [2023-11-10] Abilities that begin with "At the beginning of your end step, if you descended
//     this turn" will trigger only once during your end step, no matter how many times you
//     descended this turn. However, if you haven't descended this turn as your end step begins,
//     the ability won't trigger at all. It's not possible to put a permanent card into your
//     graveyard during the end step in time to have the ability trigger.
//   [2023-11-10] Multiple cards have abilities that begin with "At the beginning of your end step,
//     if you descended this turn." These cards don't need to have been under your control at the
//     time you descended. For example, if a permanent card is put into your graveyard during your
//     first main phase and you cast Stalactite Stalker your second main phase, its ability will
//     trigger at the beginning of your end step.
//   [2023-11-10] In either case, it doesn't matter if those cards are still in that player's
//     graveyard.

export default defineCard({
  name: "Canonized in Blood",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "At the beginning of your end step, if you descended this turn, put a +1/+1 counter on target creature you control. (You descended if a permanent card was put into your graveyard from anywhere.)\n{5}{B}{B}, Sacrifice this enchantment: Create a 4/3 white and black Vampire Demon creature token with flying.",
  activated: [
    {
      cost: { mana: "{5}{B}{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Vampire Demon Token", count: 1 },
      resolve: null,
      text: "{5}{B}{B}, Sacrifice this enchantment: Create a 4/3 white and black Vampire Demon creature token with flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, if you descended this turn, put a +1/+1 counter on target creature you control.",
      condition: { kind: "turn-history", what: "descended" },
    },
  ],
});
