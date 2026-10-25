import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 13390.
//
// The two choices are made one after the other, the second regardless of the
// first (the ruling): two `may`s in sequence.
const TEXT =
  "Whenever this creature or another Ally you control enters, you may have Allies you control gain lifelink until end of turn, and you may put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Talus Paladin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight", "Ally"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "may",
            prompt: "Have Allies you control gain lifelink until end of turn?",
            effect: {
              kind: "grant-keyword-all",
              filter: { subtype: "Ally", controlledBy: "you" },
              keyword: "lifelink",
              duration: "end-of-turn",
            },
          },
          {
            kind: "may",
            prompt: "Put a +1/+1 counter on Talus Paladin?",
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
