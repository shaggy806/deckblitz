import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "When this land enters, target creature an opponent controls doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Skyline Cascade",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n${TRIGGER_TEXT}\n{T}: Add {U}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
