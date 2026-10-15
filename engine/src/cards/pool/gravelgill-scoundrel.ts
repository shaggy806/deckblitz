import { defineCard } from "../define.js";

// EDHREC rank 20036.
//
// The optional tap is a `choose-permanents` of up to one other untapped
// creature you control (Sutina's shape); "if you do" reads whether one was
// actually tapped this way.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may tap another untapped creature you control. If you do, this creature can't be blocked this turn.";

export default defineCard({
  name: "Gravelgill Scoundrel",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 1,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you", tapped: false },
            min: 0,
            upTo: 1,
            exceptSource: true,
            then: { kind: "tap", target: 0 },
            prompt: "You may tap another untapped creature you control",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "tapped" },
            then: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
