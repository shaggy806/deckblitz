import { defineCard } from "../define.js";

// A preparation card (rule 722): its prepare spell is Channel, the pool's own
// card. "That creature" is the target, read with its counter on as the
// ability resolves.
const END_TEXT =
  "At the beginning of your end step, put a +1/+1 counter on target creature you control. Then if that " +
  "creature has power 7 or greater, this creature becomes prepared.";

export default defineCard({
  name: "Yavimaya Bloomsage",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad", "Druid"],
  power: 2,
  toughness: 2,
  prepareSpell: "Channel",
  text: `${END_TEXT} (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { power: { op: "gte", n: 7 } } },
            then: { kind: "become-prepared", target: "source" },
          },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
