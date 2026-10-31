import { defineCard } from "../define.js";

// "Of other permanents": its own exhaust ability pays full price.

const REDUCE_TEXT = "Exhaust abilities of other permanents you control cost {2} less to activate.";
const EXHAUST_TEXT =
  "Exhaust — {4}{R}{G}: Creatures and Vehicles you control gain trample until end of turn. Put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Boom Scholar",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Advisor"],
  power: 3,
  toughness: 3,
  text: `${REDUCE_TEXT}\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)`,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: { controlledBy: "you", isSource: false },
        abilityKind: "exhaust",
        reduceGeneric: 2,
      },
      text: REDUCE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { controlledBy: "you", anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
            keyword: "trample",
            duration: "end-of-turn",
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
        ],
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
  ],
});
