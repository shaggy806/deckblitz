import { defineCard } from "../define.js";

// EDHREC rank 6222.
//
// A `scries` trigger's value is the number of cards actually looked at (the
// ruling), which bounds the tap group.

const ATTACK_TEXT = "Whenever this creature attacks, scry 1.";
const SCRY_TEXT =
  "Whenever you scry, tap up to X target nonland permanents, where X is the number of cards looked at while scrying this way.";

export default defineCard({
  name: "Elvish Mariner",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elf", "Pilot"],
  power: 3,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${SCRY_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "scries", who: "you" },
      targets: [{ kind: "any-number", of: "nonland-permanent", max: { triggerValue: true } }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: SCRY_TEXT,
    },
  ],
});
