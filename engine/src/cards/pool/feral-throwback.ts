import { defineCard } from "../define.js";
import { provoke } from "../helpers.js";

// EDHREC rank 26548.

export default defineCard({
  name: "Feral Throwback",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: "Amplify 2 (As this creature enters, put two +1/+1 counters on it for each Beast card you reveal in your hand.)\nProvoke (Whenever this creature attacks, you may have target creature defending player controls untap and block it if able.)",
  amplify: 2,
  triggered: [provoke()],
});
