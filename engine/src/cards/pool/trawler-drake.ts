import { defineCard } from "../define.js";

// EDHREC rank 17461.

const ENTERS_TEXT = "This creature enters with an oil counter on it.";
const PUMP_TEXT = "This creature gets +1/+1 for each oil counter on it.";
const CAST_TEXT = "Whenever you cast a noncreature spell, put an oil counter on this creature.";

export default defineCard({
  name: "Trawler Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Drake"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${PUMP_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 1 } },
      text: ENTERS_TEXT,
    },
    {
      affects: { scope: "self" },
      grantPtPerCount: { countersOnSource: "oil", pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
});
