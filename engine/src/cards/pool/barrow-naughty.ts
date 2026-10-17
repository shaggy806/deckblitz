import { defineCard } from "../define.js";

// EDHREC rank 17291. Wilds of Eldraine. "Another Faerie": a static's
// `controls` condition leaves its own permanent out (Dáin's Company).
const LIFELINK_TEXT = "This creature has lifelink as long as you control another Faerie.";
const PUMP_TEXT = "{2}{B}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Barrow Naughty",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${LIFELINK_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Faerie" }, atLeast: 1 },
      grantKeywords: ["lifelink"],
      text: LIFELINK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
