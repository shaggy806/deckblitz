import { defineCard } from "../define.js";

// EDHREC rank 21136. A `restrict` with a filter is a rule for the rest of the
// turn, so a nonartifact creature that enters later can't block either (rule
// 611.2c — "can't block" isn't a characteristic).
export default defineCard({
  name: "Ruthless Invasion",
  manaCost: "{3}{R/P}",
  colors: ["R"],
  types: ["sorcery"],
  text: "({R/P} can be paid with either {R} or 2 life.)\nNonartifact creatures can't block this turn.",
  targets: [],
  effect: {
    kind: "restrict",
    filter: { type: "creature", notTypes: ["artifact"] },
    restrictions: ["cant-block"],
  },
});
