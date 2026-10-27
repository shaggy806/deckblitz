import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 23744.
//
// "If you control a Swamp, you may sacrifice a creature rather than pay this
// spell's mana cost": an alternative cost (rule 118.9) gated on controlling
// a Swamp, the creature chosen as the cost is paid (601.2h).

export default defineCard({
  name: "Dark Triumph",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "If you control a Swamp, you may sacrifice a creature rather than pay this spell's mana cost.\nCreatures you control get +2/+0 until end of turn.",
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "creature" }, text: "a creature" },
    condition: { kind: "controls", filter: { type: "land", subtype: "Swamp" }, atLeast: 1 },
  },
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
