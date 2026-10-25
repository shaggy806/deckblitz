import { defineCard } from "../define.js";

const EXPLOITS_TEXT =
  "When this creature exploits a creature, return to their owners' hands all creatures your opponents control with toughness less than the exploited creature's toughness.";

// The exploited creature is the trigger object, read as it last existed on
// the battlefield (the ruling).
export default defineCard({
  name: "Profaner of the Dead",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 3,
  toughness: 3,
  text: `Exploit (When this creature enters, you may sacrifice a creature.)\n${EXPLOITS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exploit: sacrifice a creature?",
        effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exploit: true },
      },
      resolve: null,
      text: "Exploit",
    },
    {
      trigger: { on: "exploits", who: "self" },
      targets: [],
      effect: {
        kind: "return-to-hand-all",
        filter: {
          type: "creature",
          controlledBy: "opponent",
          toughness: { op: "lt", n: { amount: { toughnessOf: "trigger-object" } } },
        },
      },
      resolve: null,
      text: EXPLOITS_TEXT,
    },
  ],
});
