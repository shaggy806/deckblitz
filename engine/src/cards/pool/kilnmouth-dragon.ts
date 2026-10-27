import { defineCard } from "../define.js";

// EDHREC rank 17641.

export default defineCard({
  name: "Kilnmouth Dragon",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Amplify 3 (As this creature enters, put three +1/+1 counters on it for each Dragon card you reveal in your hand.)\nFlying\n{T}: This creature deals damage equal to the number of +1/+1 counters on it to any target.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { countersOn: "source", counter: "+1/+1" }, target: 0 },
      resolve: null,
      text: "{T}: This creature deals damage equal to the number of +1/+1 counters on it to any target.",
    },
  ],
  amplify: 3,
});
