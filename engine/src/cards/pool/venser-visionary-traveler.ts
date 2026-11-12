import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// Mystery Booster Commander Edition. "That wasn't cast from your hand" is
// read of the entering creature as it enters (614.12): a creature put onto
// the battlefield (never cast) gets the counters, and so does one cast from
// anywhere but its controller's hand (a graveyard, exile, the command zone).
const STATIC_TEXT =
  "Each nontoken creature you control that wasn't cast from your hand enters with two additional +1/+1 counters on it.";
const PLUS =
  "+1: Exile up to one other target permanent you control. At the beginning of the next end step, return that card to the battlefield under its owner's control.";
const MINUS = "−2: For each opponent, return up to one target nonland permanent that player controls to its owner's hand.";
const COMMANDER_TEXT = "Venser, Visionary Traveler can be your commander.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { notTypes: ["land"] } },
});

export default defineCard({
  name: "Venser, Visionary Traveler",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Venser"],
  loyalty: 4,
  canBeCommander: true,
  text: `${STATIC_TEXT}\n${PLUS}\n${MINUS}\n${COMMANDER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: {
          type: "creature",
          token: false,
          controlledBy: "you",
          not: { castFrom: "hand", castBy: "you" },
        },
        counters: { kind: "+1/+1", amount: 2 },
      },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: {} } } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: { step: "end" },
        returnText: "Return that card to the battlefield under its owner's control.",
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
  ],
});
