import { defineCard } from "../define.js";

// EDHREC rank 21288. Frost Trickster's trigger, entering tapped.

const TAP_TEXT =
  "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Stitched Mangler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 2,
  toughness: 3,
  text: `This creature enters tapped.\n${TAP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
