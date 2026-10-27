import { defineCard } from "../define.js";

// EDHREC rank 30692.

export default defineCard({
  name: "Daru Stinger",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soldier"],
  power: 1,
  toughness: 1,
  text: "Amplify 1 (As this creature enters, put a +1/+1 counter on it for each Soldier card you reveal in your hand.)\n{T}: This creature deals damage equal to the number of +1/+1 counters on it to target attacking or blocking creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: { countersOn: "source", counter: "+1/+1" }, target: 0 },
      resolve: null,
      text: "{T}: This creature deals damage equal to the number of +1/+1 counters on it to target attacking or blocking creature.",
    },
  ],
  amplify: 1,
});
