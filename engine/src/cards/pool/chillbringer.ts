import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, tap target creature an opponent controls. It doesn't untap during its controller's next untap step.";

// An already-tapped target still stays tapped through the next untap step
// (the ruling) — `doesntUntapNext` applies whether or not the tap did.
export default defineCard({
  name: "Chillbringer",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
