import { defineCard } from "../define.js";

// EDHREC rank 19237. Devotion is counted as the trigger resolves, this
// creature's own {G} included.

export default defineCard({
  name: "Reverent Hunter",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, put a number of +1/+1 counters on it equal to your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { devotionTo: "G" } },
      resolve: null,
      text: "When this creature enters, put a number of +1/+1 counters on it equal to your devotion to green.",
    },
  ],
});
