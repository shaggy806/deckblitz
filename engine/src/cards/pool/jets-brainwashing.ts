import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 13141. Kicked, it is the same spell with Act of Treason's
// rider added; either way the Clue is made.

const CANT_BLOCK: EffectSpec = { kind: "restrict", target: 0, restrictions: ["cant-block"] };
const CLUE: EffectSpec = { kind: "create-token", token: "Clue Token", count: 1 };

export default defineCard({
  name: "Jet's Brainwashing",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Kicker {3} (You may pay an additional {3} as you cast this spell.)\n" +
    "Target creature can't block this turn. If this spell was kicked, gain control of that creature until end of turn, untap it, and it gains haste until end of turn.\n" +
    "Create a Clue token. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: ["creature"],
  effect: { kind: "sequence", effects: [CANT_BLOCK, CLUE] },
  kicker: {
    cost: "{3}",
    targets: ["creature"],
    effect: {
      kind: "sequence",
      effects: [
        CANT_BLOCK,
        { kind: "gain-control", target: 0, untilEndOfTurn: true },
        { kind: "untap", target: 0 },
        { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        CLUE,
      ],
    },
  },
});
