import { defineCard } from "../define.js";

// EDHREC rank 17181.
//
// The second mode's "next time" is a resolved `others-enter-battlefield`
// replacement with `counters` and `next: true` (rule 615.8's wording, a
// replacement under 614.1c): everything entering in that one event gets the
// counters, then it's spent. Its target gone, the spell does nothing (608.2b),
// so no replacement is made.

const TEXT_ONE = "Put two +1/+1 counters on target creature you control.";
const TEXT_TWO =
  "Put two lore counters on target Saga you control. The next time one or more enchantment creatures you control enter this turn, each enters with two additional +1/+1 counters on it.";

export default defineCard({
  name: "Storyweave",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${TEXT_ONE}\n• ${TEXT_TWO}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: TEXT_ONE,
        targets: ["creature-you-control"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      {
        text: TEXT_TWO,
        targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Saga" } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "lore", amount: 2 },
            {
              kind: "replacement-effect",
              duration: "end-of-turn",
              next: true,
              replacement: {
                event: "others-enter-battlefield",
                filter: { types: ["enchantment", "creature"], controlledBy: "you" },
                counters: { kind: "+1/+1", amount: 2 },
              },
            },
          ],
        },
      },
    ],
  },
});
