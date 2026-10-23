import { defineCard } from "../define.js";

// EDHREC rank 9439.

export default defineCard({
  name: "Subjugator Angel",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, tap all creatures your opponents control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", controlledBy: "opponent" } },
      resolve: null,
      text: "When this creature enters, tap all creatures your opponents control.",
    },
  ],
});
