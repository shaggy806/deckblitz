import { defineCard } from "../define.js";

// EDHREC rank 4001.
//
// "Phases out until this enchantment leaves the battlefield" (rule 610.4):
// it doesn't phase in during an untap step (610.4a), only right after
// Oubliette leaves — tapped, which isn't becoming tapped (the ruling). If
// Oubliette has already left as the trigger resolves, nothing phases out
// (610.4c); phased out itself (Teferi's Protection), it hasn't left, and the
// creature stays out. What's attached to the creature goes with it
// (702.26g).
const ETB =
  "When this enchantment enters, target creature phases out until this enchantment leaves the battlefield. Tap that creature as it phases in this way. (Auras and Equipment phase out with it. While permanents are phased out, they're treated as though they don't exist.)";

export default defineCard({
  name: "Oubliette",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: ETB,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "phase-out", target: 0, untilSourceLeaves: true, tappedOnReturn: true },
      resolve: null,
      text: ETB,
    },
  ],
});
