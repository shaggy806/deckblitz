import { defineCard } from "../define.js";

// EDHREC rank 4156. Flagged "Build ASAP" (B273). Fewer than X lands to
// sacrifice draws only for the ones sacrificed, but the extra land drops are
// still X. "Lands you control enter tapped this turn" is a replacement for the
// rest of the turn (rule 614.1d), a land played later this turn included.

export default defineCard({
  name: "Nahiri's Lithoforming",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Sacrifice X lands. For each land sacrificed this way, draw a card. You may play X additional lands this turn. Lands you control enter tapped this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "you", filter: { type: "land" }, count: "x" },
      { kind: "draw", amount: { thisWay: "sacrificed", filter: { type: "land" } } },
      { kind: "additional-land-drop", amount: "x" },
      {
        kind: "player-effect",
        duration: "end-of-turn",
        entersTapped: { type: "land", controlledBy: "you" },
      },
    ],
  },
});
