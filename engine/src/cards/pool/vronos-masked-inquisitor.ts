import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 6931.
//
// +1: the targets are chosen now; the delayed ability at the beginning of
// the next end step phases them out (rule 702.26b) — each still the same
// permanent (rule 400.7) — with what's attached to them, until your next
// untap step.
//
// −2: one optional slot per opponent seat (The Theorist's shape), returned
// together.
//
// −7: a 9/9 Construct artifact creature for good — its creature types
// replaced (the ruling: it keeps every other type and subtype), its
// abilities kept, base P/T set in layer 7b. An Equipment so animated falls
// off (rule 301.5c).
const PLUS =
  "+1: Up to two other target planeswalkers you control phase out at the beginning of the next end step. (Treat them and anything attached to them as though they don't exist until your next turn.)";
const MINUS = "−2: For each opponent, return up to one target nonland permanent that player controls to its owner's hand.";
const ULTIMATE =
  "−7: Target artifact you control becomes a 9/9 Construct artifact creature and gains vigilance, indestructible, and \"This creature can't be blocked.\"";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { notTypes: ["land"] } },
});

export default defineCard({
  name: "Vronos, Masked Inquisitor",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vronos"],
  loyalty: 5,
  text: `${PLUS}\n${MINUS}\n${ULTIMATE}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "any-number",
          of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "planeswalker" } } },
          max: 2,
        },
      ],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        text: "Those planeswalkers phase out.",
        effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "phase-out", target: 0 } },
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
          { kind: "return-to-hand", target: 2 },
        ],
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 9,
        toughness: 9,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Construct"],
        keywords: ["vigilance", "indestructible", "unblockable"],
        duration: "permanent",
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
