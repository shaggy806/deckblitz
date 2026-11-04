import { defineCard } from "../define.js";

// Every creature's: Malicious Eclipse's turn-long replacement with no controller
// in its filter, your own included.
const SHRINK_TEXT = "All creatures get -2/-2 until end of turn.";
const EXILE_TEXT = "If a creature would die this turn, exile it instead.";

export default defineCard({
  name: "Malicious Malfunction",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${SHRINK_TEXT} ${EXILE_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature" }, power: -2, toughness: -2, duration: "end-of-turn" },
      {
        kind: "player-effect",
        duration: "end-of-turn",
        graveyardExile: { filter: { type: "creature" }, from: "battlefield" },
      },
    ],
  },
});
