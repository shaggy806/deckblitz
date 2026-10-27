import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 29847.

export default defineCard({
  name: "Wurmskin Forger",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, distribute three +1/+1 counters among one, two, or three target creatures.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature", min: 1, max: 3 }],
      divided: { total: 3, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: "When this creature enters, distribute three +1/+1 counters among one, two, or three target creatures.",
    },
  ],
});
