import { defineCard } from "../define.js";

// Only that source's next damage to you or creatures you control (the ruling):
// to another player, a planeswalker or a creature you don't control it isn't
// prevented.

export default defineCard({
  name: "Shadowbane",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "The next time a source of your choice would deal damage to you and/or creatures you control this turn, prevent that damage. If damage from a black source is prevented this way, you gain that much life.",
  targets: [],
  effect: {
    kind: "prevent-damage-from-chosen-source",
    to: "your-side-creatures",
    amount: "next-time",
    gainLifePrevented: true,
    gainLifeFrom: { colors: ["B"] },
  },
});
