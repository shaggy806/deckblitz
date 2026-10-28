import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import type { Color } from "../../mana.js";

// EDHREC rank 24713.
//
// Each colour is checked against the lands you control as it resolves; the
// creatures you control then are the ones that gain it (rule 611.2c).
const PAIRS: readonly (readonly [Color, string])[] = [
  ["W", "Plains"],
  ["U", "Island"],
  ["B", "Swamp"],
  ["R", "Mountain"],
  ["G", "Forest"],
];
const GRANTS: EffectSpec[] = PAIRS.map(([color, land]) => ({
  kind: "conditional",
  condition: { kind: "controls", filter: { subtype: land }, atLeast: 1 },
  then: {
    kind: "grant-protection",
    filter: { type: "creature", controlledBy: "you" },
    from: { colors: [color] },
    duration: "end-of-turn",
  },
}));

export default defineCard({
  name: "Dominaria's Judgment",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Until end of turn, creatures you control gain protection from white if you control a Plains, from blue if you control an Island, from black if you control a Swamp, from red if you control a Mountain, and from green if you control a Forest.",
  targets: [],
  effect: { kind: "sequence", effects: GRANTS },
});
