import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this creature enters, scry 2.";
const CREWS_TEXT = "Whenever this creature crews a Vehicle, that Vehicle gets +1/+1 until end of turn.";

export default defineCard({
  name: "Veteran Motorist",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Pilot"],
  power: 3,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${CREWS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "crews-or-saddles", who: "self", as: ["crew"] },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: CREWS_TEXT,
    },
  ],
});
