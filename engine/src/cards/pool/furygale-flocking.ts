import { defineCard } from "../define.js";

// EDHREC rank 9870.
//
// Rulings:
//   Each of the tokens must attack the appropriate player if able, not a
//     planeswalker that player controls or a battle they protect.
//   A token that can't attack that player (tapped, "can't attack", a cost to
//     attack them) is free to attack anyone else or not at all.
//
// Per opponent, two tokens made with the requirement "attacks that player
// this turn if able" (`attacksThisTurn`, rule 508.1d) and haste until end of
// turn — both part of making them. The reduction counts your graveyard's
// instants and sorceries as the cost is determined, generic mana only.
const TEXT =
  "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.\n" +
  "For each opponent, create two 3/3 blue and red Elemental creature tokens with flying that attack that opponent this turn if able. They gain haste until end of turn.";

export default defineCard({
  name: "Furygale Flocking",
  manaCost: "{8}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countInGraveyard: { ownedBy: "you", typesAnyOf: ["instant", "sorcery"] } },
  },
  targets: [],
  effect: {
    kind: "for-each-player",
    who: "each-opponent",
    // One instruction: the tokens are created in one event.
    simultaneous: true,
    effect: {
      kind: "create-token",
      token: "Elemental Token (3/3 Blue-Red Flying)",
      count: 2,
      gainUntilEndOfTurn: ["haste"],
      attacksThisTurn: { at: "that-player" },
    },
  },
});
