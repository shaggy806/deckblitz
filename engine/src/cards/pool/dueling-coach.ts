import { defineCard } from "../define.js";

// EDHREC rank 24021. Edgar, Moonlit Sovereign's counter ability with a tap.
const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on target creature.";
const COACH_TEXT = "{4}{W}, {T}: Put a +1/+1 counter on each creature you control with a +1/+1 counter on it.";

export default defineCard({
  name: "Dueling Coach",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${COACH_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{W}", tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: COACH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
