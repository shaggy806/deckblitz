import { defineCard } from "../define.js";

// EDHREC rank 10766.
// Obstinate Familiar's optional draw skip (a `would-draw` replacement with
// `may`, rule 614.1a), only for a draw during its controller's own draw step
// (the static's condition); what the skip brings is Chronomantic Escape's
// timed attack restriction (`restrict` over a filter, a rule binding
// creatures that arrive later too, rule 611.2c): until your next turn, a
// creature without flying and without islandwalk can't attack you — the
// player, not a planeswalker you control.

const TEXT =
  "If you would draw a card during your draw step, instead you may skip that draw. If you do, until your next turn, you can't be attacked except by creatures with flying and/or islandwalk.";

export default defineCard({
  name: "Island Sanctuary",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["draw"] }] },
      replacement: {
        event: "would-draw",
        who: "you",
        may: true,
        instead: {
          text: "skip that draw (until your next turn, only creatures with flying and/or islandwalk can attack you)",
          effect: {
            kind: "restrict",
            filter: { type: "creature", not: { anyOf: [{ keyword: "flying" }, { keyword: "islandwalk" }] } },
            restrictions: [{ kind: "cant-attack", at: "you" }],
            duration: "until-your-next-turn",
          },
        },
      },
      text: TEXT,
    },
  ],
});
