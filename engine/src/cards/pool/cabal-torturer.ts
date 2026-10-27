import { defineCard } from "../define.js";

// Torment. EDHREC rank 27810. The threshold ability is Cabal Pit's
// activation condition (rule 602.5).

const SMALL_TEXT = "{B}, {T}: Target creature gets -1/-1 until end of turn.";
const THRESHOLD_TEXT =
  "Threshold — {3}{B}{B}, {T}: Target creature gets -2/-2 until end of turn. Activate only if there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Cabal Torturer",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 1,
  toughness: 1,
  text: `${SMALL_TEXT}\n${THRESHOLD_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: SMALL_TEXT,
    },
    {
      cost: { mana: "{3}{B}{B}", tap: true },
      condition: { kind: "threshold" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: THRESHOLD_TEXT,
    },
  ],
});
