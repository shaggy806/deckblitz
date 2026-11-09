import { defineCard } from "../define.js";

// EDHREC rank 17157. Sita Varma's power is read once, as the base P/T is set
// (rule 608.2h); Sita Varma herself is left out.
const TEXT =
  "Exhaust — {X}{G}{G}{U}: Put X +1/+1 counters on Sita Varma. Then you may have the base power and toughness of each other creature you control become equal to Sita Varma's power until end of turn. (Activate each exhaust ability only once.)";

export default defineCard({
  name: "Sita Varma, Masked Racer",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{G}{G}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
          {
            kind: "may",
            prompt: "Have each other creature you control's base power and toughness become Sita Varma's power?",
            effect: {
              kind: "become",
              filter: { type: "creature", controlledBy: "you" },
              exceptSource: true,
              power: { powerOf: "source" },
              toughness: { powerOf: "source" },
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
      exhaust: true,
    },
  ],
});
