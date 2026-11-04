import { defineCard } from "../define.js";

// Rulings:
//   Creatures opponents control are exiled if they would die for any reason that turn, including
//   ones that enter, become creatures or change control after this resolves.
//
// The -2/-2 is locked to what's there as it resolves (rule 611.2c); the
// replacement reads each creature as it would die.
const SHRINK_TEXT = "All creatures get -2/-2 until end of turn.";
const EXILE_TEXT = "If a creature an opponent controls would die this turn, exile it instead.";

export default defineCard({
  name: "Malicious Eclipse",
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
        graveyardExile: { filter: { type: "creature", controlledBy: "opponent" }, from: "battlefield" },
      },
    ],
  },
});
