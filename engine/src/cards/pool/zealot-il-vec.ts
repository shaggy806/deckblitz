import { defineCard } from "../define.js";

// Rulings: a target is chosen even if the damage isn't dealt; and once you
// choose to deal it, the combat damage is prevented even if that 1 damage
// was prevented or replaced.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may have it deal 1 damage to target creature. If you do, prevent all combat damage this creature would deal this turn.";

export default defineCard({
  name: "Zealot il-Vec",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 1,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Zealot il-Vec deal 1 damage to the targeted creature? Its combat damage is then prevented this turn.",
        effect: { kind: "damage", amount: 1, target: 0 },
        then: { kind: "damage-rule", by: { target: "source" }, combat: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
