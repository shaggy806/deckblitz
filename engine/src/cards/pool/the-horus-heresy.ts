import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 9335.
//
// I: "for each opponent … that player controls" is one optional slot per
// opponent, bound to that player by seat (Tempted by the Oriq's shape), each
// control change lasting while the Saga stays (`whileSource`).
// III: not targeted — starting with you, each player in turn order chooses any
// creature, knowing the choices before (`vote` with `choose`), then every
// chosen creature is destroyed at once.
const CHAPTER_I =
  "I — For each opponent, gain control of up to one target nonlegendary creature that player controls for as long as this Saga remains on the battlefield.";
const CHAPTER_II = "II — Draw a card for each creature you control but don't own.";
const CHAPTER_III = "III — Starting with you, each player chooses a creature. Destroy each creature chosen this way.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature", notSupertype: "legendary" } },
});

export default defineCard({
  name: "The Horus Heresy",
  manaCost: "{3}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSource: true },
          { kind: "gain-control", target: 1, untilEndOfTurn: false, whileSource: true },
          { kind: "gain-control", target: 2, untilEndOfTurn: false, whileSource: true },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "draw", amount: { countOf: { type: "creature", controlledBy: "you", ownedBy: "opponent" } } },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", choose: true, startingWith: "you", for: { permanent: { type: "creature" } } },
          { kind: "for-each-voted", which: "voted", simultaneous: true, effect: { kind: "destroy", target: 0 } },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
