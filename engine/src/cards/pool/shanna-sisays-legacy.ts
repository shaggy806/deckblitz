import { defineCard } from "../define.js";

// Dominaria.
//
// - "Shanna can't be the target of abilities your opponents control": a restriction on targets
//   (rule 115.1), not hexproof — `hexproofFrom: { abilitiesOnly: true, notHexproof: true }`, so an
//   effect that makes it lose hexproof (Shadowspear) leaves it.
// - "+1/+1 for each creature you control", herself included.

const TARGET_TEXT = "Shanna can't be the target of abilities your opponents control.";
const PT_TEXT = "Shanna gets +1/+1 for each creature you control.";

export default defineCard({
  name: "Shanna, Sisay's Legacy",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 0,
  toughness: 0,
  text: `${TARGET_TEXT}\n${PT_TEXT}`,
  static: [
    { affects: { scope: "self" }, hexproofFrom: { abilitiesOnly: true, notHexproof: true }, text: TARGET_TEXT },
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
});
