import { defineCard } from "../define.js";

export default defineCard({
  name: "Reflect Damage",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "The next time a source of your choice would deal damage this turn, that damage is dealt to that source's controller instead.",
  targets: [],
  effect: { kind: "prevent-damage-from-chosen-source", to: "any", amount: "next-time", redirectToSource: "controller" },
});
