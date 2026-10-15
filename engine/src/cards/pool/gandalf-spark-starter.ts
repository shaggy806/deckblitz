import { defineCard } from "../define.js";

// EDHREC rank 20712.
//
// Rulings:
//   [2026-06-29] If some of the targets are illegal targets as Gandalf's triggered ability tries
//     to resolve, the original division of damage still applies but no damage is dealt to the
//     illegal targets. If all targets are illegal, Gandalf's triggered ability doesn't resolve.
//   [2026-06-29] You choose how many targets Gandalf's triggered ability has and how the damage is
//     divided as you put the ability on the stack. Each target must receive at least 1 damage.
//
// Inferno Titan's shape: the division is made as the ability goes on the stack.

const TEXT = "When Gandalf enters, he deals 3 damage divided as you choose among one, two, or three targets.";

export default defineCard({
  name: "Gandalf, Spark Starter",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 4,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "any-target", min: 1, max: 3 }],
      divided: { total: 3, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
