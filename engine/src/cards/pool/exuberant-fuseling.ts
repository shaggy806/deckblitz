import { defineCard } from "../define.js";

// EDHREC rank 13262.

const PUMP_TEXT = "This creature gets +1/+0 for each oil counter on it.";
const OIL_TEXT =
  "When this creature enters and whenever another creature or artifact you control is put into a graveyard from the battlefield, put an oil counter on this creature.";

export default defineCard({
  name: "Exuberant Fuseling",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Goblin", "Warrior"],
  power: 0,
  toughness: 1,
  keywords: ["trample"],
  text: `Trample\n${PUMP_TEXT}\n${OIL_TEXT}`,
  static: [{ affects: { scope: "self" }, grantPtPerCount: { countersOnSource: "oil", pt: [1, 0] }, text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: OIL_TEXT,
    },
    {
      // Vat of Rebirth's trigger: a `dies` of an artifact counts any trip from
      // the battlefield to a graveyard.
      trigger: { on: "dies", who: "you-control", filter: { typesAnyOf: ["creature", "artifact"] }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: OIL_TEXT,
    },
  ],
});
