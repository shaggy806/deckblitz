import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 21578. Skyline Cascade's trigger.
const TRIGGER_TEXT =
  "When this creature enters, target creature an opponent controls doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Fogwalker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  keywords: ["skulk"],
  text: `Skulk (This creature can't be blocked by creatures with greater power.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
