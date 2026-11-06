import { defineCard } from "../define.js";

// EDHREC rank 30708.

const PT_TEXT = "This creature gets +1/+0 for each Officer token you control.";
const CAST_TEXT = "Whenever you cast a noncreature spell, create a 1/1 red Officer creature token.";

export default defineCard({
  name: "Academy Instructor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bolian", "Officer"],
  power: 0,
  toughness: 3,
  text: `${PT_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Officer", token: true, controlledBy: "you" }, pt: [1, 0] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Officer Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
