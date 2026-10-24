import { defineCard } from "../define.js";

// EDHREC rank 6956.
// Makes Human Knight → use "Human Knight Token".

export default defineCard({
  name: "Riders of Rohan",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  dash: { cost: "{4}{R}{W}" },
  text: "When this creature enters, create two 2/2 red Human Knight creature tokens with trample and haste.\nDash {4}{R}{W} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Knight Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 2/2 red Human Knight creature tokens with trample and haste.",
    },
  ],
});
