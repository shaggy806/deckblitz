import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 28959.
// Molten Primordial's shape: one optional slot per opponent's seat, each
// bound to "that player".

const ENTER_TEXT =
  "When Worf enters, for each opponent, gain control of up to one target creature that player controls with mana value 3 or less until end of turn. Untap those creatures. Until end of turn, they become Warriors in addition to their other types and gain haste.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
});

const steal = (slot: number): EffectSpec[] => [
  { kind: "gain-control", target: slot, untilEndOfTurn: true },
  { kind: "untap", target: slot },
  { kind: "become", target: slot, addSubtypes: ["Warrior"], duration: "end-of-turn" },
  { kind: "grant-keyword", target: slot, keyword: "haste", duration: "end-of-turn" },
];

export default defineCard({
  name: "Worf, Intelligence Contractor",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Spy"],
  power: 3,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: { kind: "sequence", effects: [...steal(0), ...steal(1), ...steal(2)] },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
