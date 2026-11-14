import type { EffectAmount } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 6305.
//
// "For each opponent, choose up to one target … that player controls": one
// optional slot per opponent seat (The Theorist's shape), each bound to that
// player — one that has come under anyone else's control is an illegal target
// as the spell resolves (rule 608.2b), its slot blank.
//
// "For each permanent chosen this way, its controller may exile it": each
// opponent is asked in turn order, knowing the answers before theirs, and the
// permanents whose controllers said yes are exiled together once the last has
// answered (the ruling; rule 101.4). Each opponent controls at most the one
// chosen for their seat, so "it" is the chosen permanent they control; one
// with nothing chosen (or nothing left to exile) isn't asked.
//
// "Then if one or more of the chosen permanents are still on the battlefield":
// the chosen ones still on the battlefield as the same objects (rule 400.7) —
// an illegal target was never chosen, so it doesn't count. "Up to that many"
// lands, tapped, then a shuffle; none still there, no search and no shuffle.
//
// Rulings:
//   [2021-04-16] When Disorienting Choice resolves, the next opponent in turn order that controls a
//     permanent chosen with Disorienting Choice decides whether or not to exile that permanent.
//     Then each other opponent in turn order does the same. Then all appropriate permanents are
//     exiled simultaneously. Opponents will know what choices opponents earlier in the turn order
//     made.

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { typesAnyOf: ["artifact", "enchantment"] } },
});

const CHOSEN = { inSet: { targets: [0, 1, 2] } } as const;
const STILL_THERE: EffectAmount = { countOf: CHOSEN };

export default defineCard({
  name: "Disorienting Choice",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "For each opponent, choose up to one target artifact or enchantment that player controls. For each permanent chosen this way, its controller may exile it. Then if one or more of the chosen permanents are still on the battlefield, you search your library for up to that many land cards, put them onto the battlefield tapped, then shuffle.",
  targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Exile your permanent chosen by Disorienting Choice?",
        effect: { kind: "exile-all", filter: { ...CHOSEN, controlledBy: "you" } },
      },
      {
        kind: "conditional",
        condition: { kind: "amounts", left: STILL_THERE, op: "gte", right: 1 },
        then: {
          kind: "search-library",
          filter: { type: "land" },
          destination: "battlefield",
          enterTapped: true,
          min: 0,
          max: STILL_THERE,
        },
      },
    ],
  },
});
