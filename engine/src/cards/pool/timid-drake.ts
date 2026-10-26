import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 31967. Any player's creature entering
// returns it.

const TEXT = "When another creature enters, return this creature to its owner's hand.";

export default defineCard({
  name: "Timid Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
