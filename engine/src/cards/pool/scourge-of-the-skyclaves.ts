import { defineCard } from "../define.js";

// A CDA (rule 604.3): 20 minus the highest life total among players still in
// the game — negative when someone has more than 20 (its rulings: it dies to
// state-based actions with toughness 0 or less). "Half their life, rounded
// up" is each player's own, read for each.
const KICKER_TEXT = "Kicker {4}{B} (You may pay an additional {4}{B} as you cast this spell.)";
const CAST_TEXT = "When you cast this spell, if it was kicked, each player loses half their life, rounded up.";
const PT_TEXT = "Scourge of the Skyclaves's power and toughness are each equal to 20 minus the highest life total among players.";

export default defineCard({
  name: "Scourge of the Skyclaves",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 0,
  toughness: 0,
  text: `${KICKER_TEXT}\n${CAST_TEXT}\n${PT_TEXT}`,
  kicker: { cost: "{4}{B}" },
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { amongPlayers: "greatest", of: { lifeTotal: "each" }, from: 20 },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "lose-life", who: "each-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
