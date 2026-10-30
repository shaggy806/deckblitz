import { defineCard } from "../define.js";
import { CHOSEN_COLOR } from "../../effects.js";

// Ninth Edition (9ED).
//
// The colour is chosen as the spell resolves (`choose-value`), then the
// whole hand is revealed and every card of that colour discarded — a
// multicoloured card among them.

export default defineCard({
  name: "Persecute",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose a color. Target player reveals their hand and discards all cards of that color.",
  targets: ["player"],
  effect: {
    kind: "choose-value",
    value: "color",
    then: { kind: "discard-hand", who: 0, filter: { colors: [CHOSEN_COLOR] }, reveal: true },
  },
});
