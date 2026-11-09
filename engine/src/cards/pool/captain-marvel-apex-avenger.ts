import { defineCard } from "../define.js";

// "The same number and kind": every kind in the placement that fired it, each
// at its own number (`"trigger-placement"`). "If it's not a Kree" is an
// intervening if (rule 603.4), asked as it triggers and again as it resolves.
const TEXT =
  "Whenever you put one or more counters on another creature, if it's not a Kree, you may put the same number and kind of counters on Captain Marvel.";

export default defineCard({
  name: "Captain Marvel, Apex Avenger",
  manaCost: "{5}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Kree", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "double-strike", "indestructible"],
  text: `Flying, double strike, indestructible\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "any", byYou: true, filter: { type: "creature", isSource: false } },
      condition: { kind: "trigger-object", filter: { notSubtypes: ["Kree"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put the same number and kind of counters on Captain Marvel?",
        effect: { kind: "put-counters-of", of: "trigger-placement", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
