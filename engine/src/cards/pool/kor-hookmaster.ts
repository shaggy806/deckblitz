import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 25877. Frost Lynx's shape.

const TEXT =
  "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Kor Hookmaster",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
