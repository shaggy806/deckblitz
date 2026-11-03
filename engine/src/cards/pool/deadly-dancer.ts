import { defineCard } from "../define.js";

const TRANSFORM_TEXT =
  "When this creature transforms into Deadly Dancer, add {R}{R}. Until end of turn, you don't lose this mana as steps and phases end.";
const PUMP_TEXT = "{R}{R}: This creature and another target creature each get +1/+0 until end of turn.";

export default defineCard({
  name: "Deadly Dancer",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TRANSFORM_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 2, persists: true },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}{R}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  faces: ["Alluring Suitor", "Deadly Dancer"],
  transform: true,
});
