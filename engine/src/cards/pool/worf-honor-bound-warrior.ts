import { defineCard } from "../define.js";

// EDHREC rank 30520.

const ATTACK_TEXT =
  "Whenever you attack while creatures you control have total power 8 or greater, double Worf's power until end of turn.";
const TAP_TEXT =
  "Tap two untapped artifacts and/or creatures you control: Put a +1/+1 counter on Worf. Activate only as a sorcery.";

export default defineCard({
  name: "Worf, Honor-Bound Warrior",
  manaCost: "{R/W}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Officer"],
  power: 1,
  toughness: 1,
  text: `${ATTACK_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      whileCondition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source", doubling: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TAP_TEXT,
      sorcerySpeed: true,
    },
  ],
});
