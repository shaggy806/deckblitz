import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, it deals 1 damage to you.";
const PUMP_TEXT = "{R}{R}: This creature gets +2/+0 until end of turn and deals 1 damage to you.";

export default defineCard({
  name: "Electric Eel",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 1,
  toughness: 1,
  text: `${ETB_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "you" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
