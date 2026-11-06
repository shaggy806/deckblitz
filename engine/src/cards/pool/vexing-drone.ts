import { defineCard } from "../define.js";

// EDHREC rank 31479.

export default defineCard({
  name: "Vexing Drone",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, tap target creature an opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "When this creature enters, tap target creature an opponent controls.",
    },
  ],
});
