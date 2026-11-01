import { defineCard } from "../define.js";

// The control change lasts indefinitely, whatever happens to Emrakul (the
// ruling). "Spells" and "permanents that were cast this turn" are two protections
// (rule 702.16g), one quality each.

const CAST_TEXT = "When you cast this spell, gain control of all creatures target player controls.";
const PROTECTION_TEXT = "Protection from spells and from permanents that were cast this turn";
const LEAVES_TEXT = "When Emrakul leaves the battlefield, sacrifice all creatures you control.";

export default defineCard({
  name: "Emrakul, the World Anew",
  manaCost: "{12}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 12,
  toughness: 12,
  keywords: ["flying"],
  madness: { cost: "{C}{C}{C}{C}{C}{C}" },
  text: `${CAST_TEXT}\nFlying, protection from spells and from permanents that were cast this turn\n${LEAVES_TEXT}\nMadness—Pay six {C}.`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { anyOf: [{ isSpell: true }, { isSpell: false, cast: true, enteredThisTurn: true }] } },
      text: PROTECTION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["player"],
      effect: { kind: "gain-control-all", filter: { type: "creature" }, untilEndOfTurn: false, controlledByTarget: 0 },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-all", who: "you", filter: { type: "creature" } },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
