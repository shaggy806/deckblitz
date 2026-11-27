import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 23025. One pass a card type, in order: you choose as many of
// that type the target player controls as they have in excess of yours, and
// those phase out together (rule 702.26b) before the next type is counted —
// an artifact creature phased out on the artifacts' pass isn't there for the
// creatures' (the ruling).
//
// Rulings:
//   In multiplayer games, you can choose a different target player each turn. You can
//   even choose yourself.
//   You perform the selection and phasing out on lands first, then on artifacts, then on
//   creatures. This means that if you choose an artifact creature during the second pass,
//   your opponent will control one fewer creature when it comes time to perform the third
//   pass.

const TEXT =
  "At the beginning of your upkeep, for each land target player controls in excess of the number you control, choose a land that player controls, then the chosen permanents phase out. Repeat this process for artifacts and creatures. (While they're phased out, they're treated as though they don't exist. They phase in before that player untaps during their next untap step.)";

/** One pass: that type's excess, chosen from the target player's, phased out. */
const pass = (type: "land" | "artifact" | "creature"): EffectSpec => {
  const excess = {
    difference: [{ countOf: { type, controlledBy: "you" }, forTarget: 0 }, { countOf: { type, controlledBy: "you" } }],
  } as const;
  return {
    kind: "choose-permanents",
    filter: { type },
    controlledByPlayer: { target: 0 },
    min: excess,
    upTo: excess,
    prompt: `Choose ${type}s that player controls in excess of yours to phase out`,
    thenTogether: true,
    then: { kind: "phase-out", filter: { thisWay: "chosen" } },
  };
};

export default defineCard({
  name: "Equipoise",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["player"],
      effect: { kind: "sequence", effects: [pass("land"), pass("artifact"), pass("creature")] },
      resolve: null,
      text: TEXT,
    },
  ],
});
