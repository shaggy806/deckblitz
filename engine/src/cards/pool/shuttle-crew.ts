import { defineCard } from "../define.js";

export default defineCard({
  name: "Shuttle Crew",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhen this creature enters, it deals 4 damage to target tapped creature an opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { tapped: true, type: "creature" } }],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 4 damage to target tapped creature an opponent controls.",
    },
  ],
});
