import { defineCard } from "../define.js";

// The shield counter is an additional effect of copying (rule 707.9e), not a
// copiable value: a later copy of it doesn't get one.
export default defineCard({
  name: "Undercover Operative",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Rogue"],
  power: 0,
  toughness: 0,
  text:
    "You may have this creature enter as a copy of any creature on the battlefield, except it enters with a shield " +
    "counter on it if you control that creature. (If it would be dealt damage or destroyed, remove a shield counter " +
    "from it instead.)",
  copyOnEnter: {
    filter: { type: "creature" },
    counters: [{ kind: "shield", amount: 1, ifYouControlCopied: true }],
  },
});
