import { defineCard } from "../define.js";

// EDHREC rank 17773.
//
// Rulings:
//   [2024-07-26] You may tap any untapped tokens you control, including creature tokens you
//     control that you haven't controlled continuously since the beginning of your most recent
//     turn, to pay the cost of Tangle Tumbler's last ability.

// A Vehicle with no crew: its last ability is how it becomes a creature.
// Tapping two untapped tokens is a `tapOthers` cost (Baylen's shape) — a
// summoning-sick creature token can pay it (the ruling; rule 302.6 is only
// about a creature's own {T}), and a token copy of this Vehicle may tap
// itself for it.
const COUNTER_TEXT = "{3}, {T}: Put a +1/+1 counter on target creature.";
const ANIMATE_TEXT = "Tap two untapped tokens you control: This Vehicle becomes an artifact creature until end of turn.";

export default defineCard({
  name: "Tangle Tumbler",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${COUNTER_TEXT}\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { token: true, controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
