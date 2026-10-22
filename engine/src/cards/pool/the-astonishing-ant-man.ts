import { defineCard } from "../define.js";

// EDHREC rank 11582.
// Makes Insect → use "Insect Token".

export default defineCard({
  name: "The Astonishing Ant-Man",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Hero"],
  power: 1,
  toughness: 1,
  text: "Whenever you draw a card, put a +1/+1 counter on The Astonishing Ant-Man.\n{2}{G}, {T}, Remove any number of +1/+1 counters from The Astonishing Ant-Man: Create that many 1/1 green Insect creature tokens.",
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you draw a card, put a +1/+1 counter on The Astonishing Ant-Man.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true, removeCounter: { kind: "+1/+1", count: "x" } },
      targets: [],
      effect: { kind: "create-token", token: "Insect Token", count: "x" },
      resolve: null,
      text: "{2}{G}, {T}, Remove any number of +1/+1 counters from The Astonishing Ant-Man: Create that many 1/1 green Insect creature tokens.",
    },
  ],
});
