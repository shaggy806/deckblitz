import { defineCard } from "../define.js";

const ROLL_TEXT =
  "Whenever you roll a 4 or higher, create a 3/3 colorless Robot artifact creature token. If you rolled 6 or higher, instead create that token and a Treasure token.";
const ACTIVATE_TEXT =
  "{4}, {T}: Roll a six-sided die plus an additional six-sided die for each mana from Treasures spent to activate this ability.";

export default defineCard({
  name: "Mr. House, President and CEO",
  manaCost: "{R}{W}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human"],
  power: 0,
  toughness: 4,
  text: `${ROLL_TEXT}\n${ACTIVATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "rolls-die", who: "you", die: { atLeast: 4 } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-value", compare: { op: "gte", n: 6 } },
        then: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "create-token", token: "Robot Token (Automated Assembly Line)", count: 1 },
            { kind: "create-token", token: "Treasure Token", count: 1 },
          ],
        },
        else: { kind: "create-token", token: "Robot Token (Automated Assembly Line)", count: 1 },
      },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 6,
        count: { sum: [1, { manaSpentOf: "this-ability", from: { subtype: "Treasure" } }] },
      },
      resolve: null,
      text: ACTIVATE_TEXT,
    },
  ],
});
