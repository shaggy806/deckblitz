import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// Star Trek Commander (TRC). "Yes" and "No" are ability words; each ability
// takes exactly two creatures, neither of them Pike.

const YES_TEXT = "Yes — {1}, {T}: Untap two other target creatures.";
const NO_TEXT = "No — {2}, {T}: Tap two other target creatures.";
const TWO_OTHERS: TargetSpec[] = [
  { kind: "other", of: "creature" },
  { kind: "other", of: { kind: "other", of: "creature" }, than: { slots: [0] } },
];

export default defineCard({
  name: "Fleet Captain Christopher Pike",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 0,
  toughness: 6,
  text: `${YES_TEXT}\n${NO_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: TWO_OTHERS,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
        ],
      },
      resolve: null,
      text: YES_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: TWO_OTHERS,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
        ],
      },
      resolve: null,
      text: NO_TEXT,
    },
  ],
});
