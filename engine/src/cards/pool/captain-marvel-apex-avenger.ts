import { defineCard } from "../define.js";

// "The same number and kind": the trigger value and the kind whose placement
// fired it (`counterOfTrigger`). Counters of two kinds put at once are two
// placements here, each copied by its own trigger — the same counters as one
// trigger copying both. "If it's not a Kree" is an intervening if (rule
// 603.4), asked as it triggers and again as it resolves.
const TEXT =
  "Whenever you put one or more counters on another creature, if it's not a Kree, you may put the same number and kind of counters on Captain Marvel.";

export default defineCard({
  name: "Captain Marvel, Apex Avenger",
  manaCost: "{5}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Kree", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "double-strike", "indestructible"],
  text: `Flying, double strike, indestructible\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "any", byYou: true, filter: { type: "creature", isSource: false } },
      condition: { kind: "trigger-object", filter: { notSubtypes: ["Kree"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put the same number and kind of counters on Captain Marvel?",
        effect: {
          kind: "add-counter",
          target: "source",
          counter: "+1/+1",
          counterOfTrigger: true,
          amount: { triggerValue: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
