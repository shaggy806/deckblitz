import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 30332. "Sacrifice it unless you remove a +1/+1
// counter from it": the removal is the controller's choice, open only while
// it has one (Magmatic Sprinter's shape).

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this creature unless you remove a +1/+1 counter from it.";

export default defineCard({
  name: "Junk Golem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 0,
  text: `This creature enters with three +1/+1 counters on it.\n${UPKEEP_TEXT}\n{1}, Discard a card: Put a +1/+1 counter on this creature.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
        then: {
          kind: "may",
          prompt: "Remove a +1/+1 counter from Junk Golem? (Otherwise sacrifice it.)",
          effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}, Discard a card: Put a +1/+1 counter on this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This creature enters with three +1/+1 counters on it.",
    },
  ],
});
