import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 9406.
const TEXT =
  "Return up to one target creature card from your graveyard to the battlefield.\n" +
  "Corrupted — For each opponent who has three or more poison counters as you cast this spell, put up to one target creature card from that player's graveyard onto the battlefield under your control.";

// "For each opponent who has three or more poison counters as you cast this
// spell … that player's graveyard": one optional slot per opponent, bound to
// that player by seat (a game seats at most four), defined only while that
// player has three or more poison counters as the targets are chosen
// (`TargetSeat.onlyIf`, rule 601.2c) — a slot for anyone else offers nothing.
// The opponents' cards enter together, under your control, after yours.
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: {
    kind: "card-in-graveyard",
    whose: { seat, onlyIf: { kind: "player-counters", counter: "poison", who: "that-player", atLeast: 3 } },
    filter: { type: "creature" },
  },
});

export default defineCard({
  name: "Geth's Summons",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
    perOpponent(1),
    perOpponent(2),
    perOpponent(3),
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [1, 2, 3].map((slot) => ({
          kind: "put-onto-battlefield" as const,
          target: slot,
          underYourControl: true,
        })),
      },
    ],
  },
});
