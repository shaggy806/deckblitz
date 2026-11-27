import { defineCard } from "../define.js";

// The sacrifice and the discard are one additional cost, paid as the spell goes
// on the stack after its mana (601.2h): the lands tapped for {B}{B}{B} are
// sacrificed too. Paid once, never zero or several times (the ruling); only
// permanents the caster controls.

export default defineCard({
  name: "Kaervek's Spite",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice all permanents you control and discard your hand.\nTarget player loses 5 life.",
  additionalCost: {
    also: {
      text: "Sacrifice all permanents you control and discard your hand",
      do: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-all", who: "you", filter: {} },
          { kind: "discard-hand", who: "you" },
        ],
      },
    },
  },
  targets: ["player"],
  effect: { kind: "lose-life", amount: 5, target: 0 },
});
