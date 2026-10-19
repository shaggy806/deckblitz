import { defineCard } from "../define.js";

// EDHREC rank 16832. The Brothers' War.
// Rulings:
//   Because creatures controlled by opponents aren't being put into a graveyard, any "when
//   [this creature] dies" triggered abilities those creatures have won't trigger.

const EXILE_TEXT = "If a creature an opponent controls would die, exile it instead.";
const PUMP_TEXT = "{1}: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Misery's Shadow",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shade"],
  power: 2,
  toughness: 2,
  text: `${EXILE_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent" },
      },
      text: EXILE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
