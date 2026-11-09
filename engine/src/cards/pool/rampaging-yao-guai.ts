import { defineCard } from "../define.js";

// EDHREC rank 2987. The group's total reads the X the creature was cast with
// (a token copy's or a non-cast entry's X is 0, so only mana value 0 targets).
const TEXT = "When this creature enters, destroy any number of target artifacts and/or enchantments with total mana value X or less.";

export default defineCard({
  name: "Rampaging Yao Guai",
  manaCost: "{X}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear", "Mutant"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\nThis creature enters with X +1/+1 counters on it.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "artifact-or-enchantment", maxTotalManaValue: "x" }],
      effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
