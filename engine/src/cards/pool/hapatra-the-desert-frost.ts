import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 24070.
//
// "For each opponent, … up to one target creature that player controls":
// one optional slot per opponent seat (Hammers of Moradin's shape); a seat
// with no target chosen is a hole the tap and the stun counter skip.
const ENTERS_TEXT =
  "When Hapatra enters, for each opponent, tap up to one target creature that player controls. Put a stun counter on each of those creatures.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "Hapatra, the Desert Frost",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 3,
  text: "When Hapatra enters, for each opponent, tap up to one target creature that player controls. Put a stun counter on each of those creatures. (If a permanent with a stun counter would become untapped, remove one from it instead.)\n{2}{U}: Untap target creature.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "{2}{U}: Untap target creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
          { kind: "tap", target: 2 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
          { kind: "add-counter", target: 2, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
