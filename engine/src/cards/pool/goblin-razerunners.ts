import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 17452.
//
// Rulings: the counters are counted as the trigger resolves — as it last
// existed on the battlefield if it has left (`countersOn: "source"` reads
// its last-known counters).
const SAC_TEXT = "{1}{R}, Sacrifice a land: Put a +1/+1 counter on this creature.";
const END_TEXT =
  "At the beginning of your end step, you may have this creature deal damage equal to the number of +1/+1 counters on it to target player or planeswalker.";

export default defineCard({
  name: "Goblin Razerunners",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 4,
  text: `${SAC_TEXT}\n${END_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Have Goblin Razerunners deal damage equal to its +1/+1 counters to target player or planeswalker?",
        effect: { kind: "damage", amount: { countersOn: "source", counter: "+1/+1" }, target: 0 },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
