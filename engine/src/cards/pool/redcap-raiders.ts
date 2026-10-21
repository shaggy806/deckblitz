import { defineCard } from "../define.js";

// EDHREC rank 24268.
//
// The optional tap is a `choose-permanents` of up to one untapped non-Human
// creature you control (Civil Servant's shape) — Redcap Raiders itself, a
// Goblin, if it's untapped; "if you do" reads whether one was tapped this
// way, so at most one tap and one bonus (the rulings).

const TEXT =
  "Whenever this creature attacks, you may tap an untapped non-Human creature you control. If you do, this creature gets +1/+1 and gains trample until end of turn.";

export default defineCard({
  name: "Redcap Raiders",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", notSubtypes: ["Human"], controlledBy: "you", tapped: false },
            min: 0,
            upTo: 1,
            then: { kind: "tap", target: 0 },
            prompt: "You may tap an untapped non-Human creature you control",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "tapped" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
