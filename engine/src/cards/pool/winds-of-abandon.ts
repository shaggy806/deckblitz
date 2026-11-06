import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 1940.
//
// Rulings:
//   [2019-06-14] If a creature is exiled but ends up in another zone, it's still a "creature
//     exiled this way" for Winds of Abandon.
//   [2024-01-12] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as an overload cost), add any cost increases, then apply any cost
//     reductions. The mana value of the spell remains unchanged, no matter what the total cost to
//     cast it was.
//   [2024-01-12] Because a spell with overload doesn't target when its overload cost is paid, it
//     may affect permanents with hexproof or with protection from the appropriate color.
//   [2024-01-12] If you are instructed to cast a spell with overload "without paying its mana
//     cost," you can't choose to pay its overload cost instead.
//   [2024-01-12] If you don't pay the overload cost of a spell with overload, that spell will have
//     a single target. If you pay the overload cost, the spell won't have any targets.
//
// "For each creature exiled this way, its controller searches their library
// for a basic land card": each player one or more of whose creatures went
// (`whoseAmount`, the creature's controller as it left) searches once for
// that many basic lands, and only they shuffle. The searches are held until
// the last (Field of Ruin's `choicesHeld`), so "those players put those cards
// onto the battlefield tapped" is one entry, then the shuffles.

const theirSearch: EffectSpec = {
  kind: "for-each-player",
  who: "each-player",
  whoseAmount: { thisWay: "exiled", who: "each" },
  choicesHeld: true,
  effect: {
    kind: "search-library",
    who: "that-player",
    filter: { type: "land", supertype: "basic" },
    destination: "battlefield",
    enterTapped: true,
    min: 0,
    max: { thisWay: "exiled", who: "each" },
  },
};

export default defineCard({
  name: "Winds of Abandon",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target creature you don't control. For each creature exiled this way, its controller searches their library for a basic land card. Those players put those cards onto the battlefield tapped, then shuffle.\nOverload {4}{W}{W} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-an-opponent-controls"],
  effect: { kind: "sequence", effects: [{ kind: "exile", target: 0 }, theirSearch] },
  overload: {
    cost: "{4}{W}{W}",
    effect: {
      kind: "sequence",
      effects: [{ kind: "exile-all", filter: { type: "creature", controlledBy: "opponent" } }, theirSearch],
    },
  },
});
