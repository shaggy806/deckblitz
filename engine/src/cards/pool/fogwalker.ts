import { defineCard } from "../define.js";

// EDHREC rank 21578. Skyline Cascade's enters trigger.

export default defineCard({
  name: "Fogwalker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  keywords: ["skulk"],
  text: "Skulk (This creature can't be blocked by creatures with greater power.)\nWhen this creature enters, target creature an opponent controls doesn't untap during its controller's next untap step.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: "When this creature enters, target creature an opponent controls doesn't untap during its controller's next untap step.",
    },
  ],
});
