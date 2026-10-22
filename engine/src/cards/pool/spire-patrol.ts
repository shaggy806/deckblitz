import { defineCard } from "../define.js";

// EDHREC rank 28604. An already-tapped creature can be targeted, and still
// doesn't untap next time (the ruling).

const TRIGGER =
  "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Spire Patrol",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
