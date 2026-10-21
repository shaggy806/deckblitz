import { defineCard } from "../define.js";

// EDHREC rank 16953. Ikoria: Lair of Behemoths.
//
// A flying counter is a keyword counter (rule 122.1b). "Each creature you
// control with flying" reads flying however it was gained.
const ENTER_TEXT = "When this creature enters, put a flying counter on target non-Human creature you control.";
const PUMP_TEXT = "{2}{U}, {T}: Put a +1/+1 counter on each creature you control with flying.";

export default defineCard({
  name: "Wingspan Mentor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${ENTER_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", keyword: "flying" },
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
      effect: { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
