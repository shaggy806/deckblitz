import { defineCard } from "../define.js";

// X is read as the ability resolves; a creature that has left is read by
// its last known power (the ruling), as Kresh's `powerOf: "trigger-object"`.
export default defineCard({
  name: "Hamletback Goliath",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 6,
  toughness: 6,
  text: "Whenever another creature enters, you may put X +1/+1 counters on this creature, where X is that creature's power.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put X +1/+1 counters on Hamletback Goliath?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { powerOf: "trigger-object" } },
      },
      resolve: null,
      text: "Whenever another creature enters, you may put X +1/+1 counters on this creature, where X is that creature's power.",
    },
  ],
});
