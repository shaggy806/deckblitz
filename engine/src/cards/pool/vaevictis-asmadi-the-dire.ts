import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// Dominaria (DOM). EDHREC rank 9404.
// Rulings:
//   If any player controls no permanents, the ability won't have sufficient legal targets, so
//     it's removed from the stack without any effect.
//   If any of the target permanents aren't sacrificed (most likely because one became an
//     illegal target), that permanent's controller won't reveal or put a card onto the
//     battlefield.
//   The ability resolves during the declare attackers step, before blockers are chosen.
//   You must target one of your permanents to sacrifice as well.
//
// One required target slot a seat, seat 0 being you (Guff Rewrites History's
// shape): a player still in the game with no permanent leaves the trigger with
// no legal targets (rule 603.3d). Each sacrifices their own, all at once
// (701.21a — an illegal slot is skipped, rule 608.2b). Only a player who
// sacrificed this way reveals; each reveal is held until every player has
// revealed, then the permanent cards enter together (rule 101.4); a card that
// isn't a permanent card stays on top.
const ofSeat = (seat: number): TargetSpec => ({ kind: "permanent", whose: { seat }, filter: {} });

const TEXT =
  "Whenever Vaevictis Asmadi attacks, for each player, choose target permanent that player controls. Those players sacrifice those permanents. Each player who sacrificed a permanent this way reveals the top card of their library, then puts it onto the battlefield if it's a permanent card.";

export default defineCard({
  name: "Vaevictis Asmadi, the Dire",
  manaCost: "{3}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elder", "Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [ofSeat(0), ofSeat(1), ofSeat(2), ofSeat(3)],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [0, 1, 2, 3].map((slot) => ({ kind: "sacrifice-target" as const, target: slot, byItsController: true })),
          },
          {
            kind: "for-each-player",
            who: "each-player",
            whoIf: { kind: "this-way", what: "sacrificed", who: "that-player" },
            choicesHeld: true,
            effect: {
              kind: "look-and-choose",
              player: "that-player",
              zone: "library",
              count: 1,
              reveal: true,
              min: 1,
              max: 1,
              filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
              destination: "battlefield",
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
