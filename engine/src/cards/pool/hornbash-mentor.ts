import { defineCard } from "../define.js";

// EDHREC rank 13020. Ikoria: Lair of Behemoths.
const TRIGGER_TEXT = "When this creature enters, put a trample counter on target non-Human creature you control.";
const ACTIVATED_TEXT = "{2}{G}, {T}: Put a +1/+1 counter on each creature you control with trample.";

export default defineCard({
  name: "Hornbash Mentor",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${TRIGGER_TEXT}\n${ACTIVATED_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", keyword: "trample" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "you", notSubtypes: ["Human"] } }],
      effect: { kind: "add-counter", target: 0, counter: "trample", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
