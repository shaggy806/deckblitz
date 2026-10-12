import { defineCard } from "../define.js";
import { VOID_CONDITION } from "../helpers.js";

// EDHREC rank 13131.
export default defineCard({
  name: "Tragic Trajectory",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Target creature gets -2/-2 until end of turn.\n" +
    "Void — That creature gets -10/-10 until end of turn instead if a nonland permanent left the battlefield this turn or a spell was warped this turn.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: VOID_CONDITION,
    then: { kind: "modify-pt", target: 0, power: -10, toughness: -10, duration: "end-of-turn" },
    else: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
  },
});
