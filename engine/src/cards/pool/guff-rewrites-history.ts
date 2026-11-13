import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// "For each player, choose target … that player controls": one required slot a seat, seat 0 being
// you; a seat past the table or whose player has left needs none (`emptySeatOptional`), and a
// player still in the game with no such permanent leaves the spell uncastable (rule 601.2c).
//
// The permanents go into their owners' libraries together, each library shuffled (rule
// 701.24a). Then "each player who controlled one of those permanents" — the controller each
// still-legal target had as it left (its last-known information, so a commander its owner put in
// the command zone instead still counts) — exiles from the top until a nonland card, the rest on
// the bottom in a random order. Only once every card is exiled does each player, in turn order,
// decide whether to cast the one they exiled (rule 101.4): a player knows the others' cards first.
const ofSeat = (seat: number): TargetSpec => ({
  kind: "permanent",
  whose: { seat },
  filter: { notTypes: ["enchantment", "land"] },
});

const exilesUntilNonland = (slot: number): EffectSpec => ({
  kind: "for-each-player",
  who: { controllerOf: slot },
  effect: {
    kind: "reveal-until",
    whose: "that-player",
    filter: { notTypes: ["land"] },
    exile: true,
    rest: "bottom-random",
    keepFound: true,
  },
});

export default defineCard({
  name: "Guff Rewrites History",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "For each player, choose target nonenchantment, nonland permanent that player controls. Those permanents' owners shuffle them into their libraries. Each player who controlled one of those permanents exiles cards from the top of their library until they exile a nonland card, then puts the rest on the bottom of their library in a random order. Each player may cast the nonland card they exiled without paying its mana cost.",
  targets: [ofSeat(0), ofSeat(1), ofSeat(2), ofSeat(3)],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "shuffle" },
      ...[0, 1, 2, 3].map(exilesUntilNonland),
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "cast-now",
          from: "exiled-this-way",
          by: "that-player",
          free: true,
          spell: { ownedByRef: "that-player" },
        },
      },
    ],
  },
});
