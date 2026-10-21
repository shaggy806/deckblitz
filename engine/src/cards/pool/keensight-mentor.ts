import { defineCard } from "../define.js";

// EDHREC rank 22763. Ikoria: Lair of Behemoths.

const ENTERS_TEXT = "When this creature enters, put a vigilance counter on target non-Human creature you control.";
const PUMP_TEXT = "{1}{W}, {T}: Put a +1/+1 counter on each creature you control with vigilance.";

export default defineCard({
  name: "Keensight Mentor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", keyword: "vigilance" },
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
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notSubtypes: ["Human"] } }],
      effect: { kind: "add-counter", target: 0, counter: "vigilance", amount: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
