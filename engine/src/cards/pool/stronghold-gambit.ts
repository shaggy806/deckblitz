import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// EDHREC rank 24852. Nemesis.
//
// Rulings:
//   [2004-10-04] You don't have to choose a creature card, but choosing a non creature does
//     nothing except maybe bluff your opponent.
//   [2004-10-04] Creature cards which are revealed but are not the lowest cost, or any
//     non-creature cards revealed remain in their owners' hands and stop being revealed.
//
// Each player chooses a card in their own hand, which shows nobody the card (a `look-and-choose`
// with `destination: "stay"`), so nobody learns another's choice before they're all revealed
// together (`reveal-hand` `only` the chosen cards). Then every creature card revealed this way
// whose mana value is the lowest among them goes onto the battlefield under its owner's control,
// all at once.

/** The lowest mana value among the creature cards revealed this way. */
const LOWEST: EffectAmount = {
  aggregate: "min",
  of: "mana-value",
  filter: { type: "creature" },
  in: { thisWay: "revealed", who: "each-player" },
};

export default defineCard({
  name: "Stronghold Gambit",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player chooses a card in their hand. Then each player reveals their chosen card. The owner of each creature card revealed this way with the lowest mana value puts it onto the battlefield.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "stay",
          leftover: "stay",
          prompt: "Choose a card in your hand — it's revealed once every player has chosen",
        },
      },
      { kind: "reveal-hand", who: "each-player", only: { thisWay: "chosen" } },
      {
        kind: "put-exiled-this-way-onto-battlefield",
        revealed: true,
        filter: { type: "creature", manaValue: { op: "eq", n: { amount: LOWEST } } },
      },
    ],
  },
});
