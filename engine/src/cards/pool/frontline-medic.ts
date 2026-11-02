import { defineCard } from "../define.js";

const BATTALION_TEXT = "Battalion — Whenever this creature and at least two other creatures attack, creatures you control gain indestructible until end of turn.";
const COUNTER_TEXT = "Sacrifice this creature: Counter target spell with {X} in its mana cost unless its controller pays {3}.";

export default defineCard({
  name: "Frontline Medic",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  text: `${BATTALION_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: BATTALION_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "spell", filter: { xInManaCost: true } }],
      effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
