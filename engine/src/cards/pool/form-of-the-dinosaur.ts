import { defineCard } from "../define.js";

// Rulings: "your life total becomes 15" is gaining or losing the difference
// (rule 119.5), Angel of Grace's shape; the upkeep fight isn't optional, and
// if its target has left by the time it resolves, you aren't dealt damage
// (the ability has no legal target, so it doesn't resolve). The creature is
// still on the battlefield after the 15 damage — state-based actions wait for
// the ability to finish — so it deals damage equal to its power then.
const ENTERS = "When this enchantment enters, your life total becomes 15.";
const UPKEEP =
  "At the beginning of your upkeep, this enchantment deals 15 damage to target creature an opponent controls and that creature deals damage equal to its power to you.";

export default defineCard({
  name: "Form of the Dinosaur",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTERS}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "life-total", atMost: 14 },
        then: { kind: "gain-life", amount: { difference: [15, { lifeTotal: "you" }] } },
        else: {
          kind: "conditional",
          condition: { kind: "life-total", atLeast: 16 },
          then: { kind: "lose-life", amount: { difference: [{ lifeTotal: "you" }, 15] } },
        },
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 15, target: 0 },
          { kind: "damage", amount: { powerOf: 0 }, who: "you", from: { target: 0 } },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
