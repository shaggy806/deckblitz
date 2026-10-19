import { defineCard } from "../define.js";

// EDHREC rank 12125.
//
// "That creature" is the other target only, never Trygon Prime itself, even
// with no target chosen (the ruling): the unblockable grant reads slot 0,
// which does nothing when it's empty or illegal.

const ASSAULT_TEXT =
  "Subterranean Assault — Whenever this creature attacks, put a +1/+1 counter on it and a +1/+1 counter on up to one other target attacking creature. That creature can't be blocked this turn.";

export default defineCard({
  name: "Trygon Prime",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 4,
  toughness: 4,
  text: ASSAULT_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ASSAULT_TEXT,
    },
  ],
});
