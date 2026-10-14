import { defineCard } from "../define.js";

// The life is lost whether or not the target could be changed; the spell's
// mana value is read as it is on the stack (its X counted — rule 202.3e).
export default defineCard({
  name: "Imp's Mischief",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Change the target of target spell with a single target. You lose life equal to that spell's mana value.",
  targets: [{ kind: "stack", spells: "any", abilities: false, singleTarget: true }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "change-targets", target: 0, how: "change" },
      { kind: "lose-life", amount: { manaValueOf: 0 } },
    ],
  },
});
