import { defineCard } from "../define.js";

// EDHREC rank 13203.
// Makes Gremlin → use "Gremlin Token".
//
// "Then" reads the creatures you control after the two Gremlins are there.
// The pump reaches the creatures you control as it resolves (rule 611.2c).
const ENTERS_TEXT =
  "When this enchantment enters, create two 1/1 red Gremlin creature tokens. Then you get an amount of {E} (energy counters) equal to the number of creatures you control.";
const PUMP_TEXT = "Pay {E}{E}{E}{E}: Creatures you control get +1/+0 and gain haste until end of turn.";

export default defineCard({
  name: "Scurry of Gremlins",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Gremlin Token", count: 2 },
          { kind: "get-energy", amount: { countOf: { type: "creature", controlledBy: "you" } } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 4 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
