import { defineCard } from "../define.js";

// EDHREC rank 12545. Ikoria: Lair of Behemoths.
//
// A lifelink counter is a keyword counter (rule 122.1b). "Each creature you
// control with lifelink" reads lifelink however it was gained.
const ENTER_TEXT = "When this creature enters, put a lifelink counter on target non-Human creature you control.";
const PUMP_TEXT = "{1}{B}, {T}: Put a +1/+1 counter on each creature you control with lifelink.";

export default defineCard({
  name: "Duskfang Mentor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: `${ENTER_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", keyword: "lifelink" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "you", notSubtypes: ["Human"] } }],
      effect: { kind: "add-counter", target: 0, counter: "lifelink", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
