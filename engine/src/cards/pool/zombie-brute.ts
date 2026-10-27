import { defineCard } from "../define.js";

// EDHREC rank 30114.

export default defineCard({
  name: "Zombie Brute",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: "Amplify 1 (As this creature enters, put a +1/+1 counter on it for each Zombie card you reveal in your hand.)\nTrample",
  amplify: 1,
});
