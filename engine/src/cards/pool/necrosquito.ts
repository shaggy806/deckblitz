import { defineCard } from "../define.js";

// EDHREC rank 15780.

const ENTERS_TEXT = "This creature enters with two oil counters on it.";
const PUMP_TEXT = "This creature gets +1/+1 for each oil counter on it.";
const DIES_TEXT =
  "Whenever another creature or artifact you control is put into a graveyard from the battlefield, put an oil counter on this creature.";

export default defineCard({
  name: "Necrosquito",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Insect"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${PUMP_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 2 } },
      text: ENTERS_TEXT,
    },
    { affects: { scope: "self" }, grantPtPerCount: { countersOnSource: "oil", pt: [1, 1] }, text: PUMP_TEXT },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { typesAnyOf: ["creature", "artifact"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
