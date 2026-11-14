import { defineCard } from "../define.js";

export default defineCard({
  name: "Ride Guide",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Employee"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: "When this creature enters, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)",
    },
  ],
});
