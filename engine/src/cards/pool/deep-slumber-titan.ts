import { defineCard } from "../define.js";

// EDHREC rank 26258. Shadowmoor.

export default defineCard({
  name: "Deep-Slumber Titan",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 7,
  toughness: 7,
  text: "This creature enters tapped.\nThis creature doesn't untap during your untap step.\nWhenever this creature is dealt damage, untap it.",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever this creature is dealt damage, untap it.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
});
