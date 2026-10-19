import { defineCard } from "../define.js";

// Streets of New Capenna. The counters are that creature's power as it last
// existed on the battlefield (rule 608.2h) — it's in a hand by then — which
// the returned-this-way entry reads.
const END_TEXT =
  "At the beginning of your end step, you may return another creature you control to its owner's hand, then put a number of +1/+1 counters equal to that creature's power on this creature.";

export default defineCard({
  name: "First Responder",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ogre", "Citizen"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 0,
        upTo: 1,
        exceptSource: true,
        then: {
          kind: "sequence",
          effects: [
            { kind: "return-to-hand", target: 0 },
            {
              kind: "add-counter",
              target: "source",
              counter: "+1/+1",
              amount: { thisWay: "returned-to-hand", sumOf: "power" },
            },
          ],
        },
        prompt: "You may return another creature you control to its owner's hand",
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
