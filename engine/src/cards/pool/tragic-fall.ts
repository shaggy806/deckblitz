import { defineCard } from "../define.js";

// Hellbent is checked as the spell resolves; the spell itself is on the
// stack then, not in the hand.
const BASE_TEXT = "Target creature gets -3/-3 until end of turn.";
const HELLBENT_TEXT =
  "Hellbent — That creature gets -13/-13 until end of turn instead if you have no cards in hand.";

export default defineCard({
  name: "Tragic Fall",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `${BASE_TEXT}\n${HELLBENT_TEXT}`,
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "hand-size", atMost: 0 },
    then: { kind: "modify-pt", target: 0, power: -13, toughness: -13, duration: "end-of-turn" },
    else: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
  },
});
