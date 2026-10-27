import { defineCard } from "../define.js";

// EDHREC rank 28958.

export default defineCard({
  name: "Aven Warhawk",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Amplify 1 (As this creature enters, put a +1/+1 counter on it for each Bird and/or Soldier card you reveal in your hand.)\nFlying",
  amplify: 1,
});
