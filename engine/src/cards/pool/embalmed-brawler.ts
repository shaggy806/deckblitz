import { defineCard } from "../define.js";

// EDHREC rank 30905.

export default defineCard({
  name: "Embalmed Brawler",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: "Amplify 1 (As this creature enters, put a +1/+1 counter on it for each Zombie card you reveal in your hand.)\nWhenever this creature attacks or blocks, you lose 1 life for each +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: "Whenever this creature attacks or blocks, you lose 1 life for each +1/+1 counter on it.",
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: "Whenever this creature attacks or blocks, you lose 1 life for each +1/+1 counter on it.",
    },
  ],
  amplify: 1,
});
