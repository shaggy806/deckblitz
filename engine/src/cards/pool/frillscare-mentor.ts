import { defineCard } from "../define.js";

// EDHREC rank 22402. Ikoria: Lair of Behemoths.
//
// A menace counter is a keyword counter (rule 122.1b). "Each creature you
// control with menace" reads menace however it was gained.
const ENTER_TEXT =
  "When this creature enters, put a menace counter on target non-Human creature you control. (It can't be blocked except by two or more creatures.)";
const PUMP_TEXT = "{2}{R}, {T}: Put a +1/+1 counter on each creature you control with menace.";

export default defineCard({
  name: "Frillscare Mentor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", keyword: "menace" },
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
      effect: { kind: "add-counter", target: 0, counter: "menace", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
