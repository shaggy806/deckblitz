import { defineCard } from "../define.js";

// EDHREC rank 31506.

export default defineCard({
  name: "Glowering Rogon",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: "Amplify 1 (As this creature enters, put a +1/+1 counter on it for each Beast card you reveal in your hand.)",
  amplify: 1,
});
