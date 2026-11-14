import { defineCard } from "../define.js";

// EDHREC rank 9376.
//
// Rulings:
//   It triggers even when dealt lethal damage. The source's controller either sacrifices that
//   many permanents or loses that much life, never some of each; without that many permanents
//   they must lose the life (the option isn't offered, rule 118.3), and they may always choose
//   not to sacrifice. The player is whoever controls the source as the ability resolves (its
//   last known information if it has left).

export default defineCard({
  name: "Archfiend of Spite",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  madness: { cost: "{3}{B}{B}" },
  text: "Flying\nWhenever a source an opponent controls deals damage to this creature, that source's controller loses that much life unless they sacrifice that many permanents of their choice.\nMadness {3}{B}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "opponent", to: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [
          {
            sacrifice: {},
            times: { triggerValue: true },
            text: "Sacrifice that many permanents",
          },
        ],
        otherwise: { kind: "lose-life", amount: { triggerValue: true }, who: "trigger-controller" },
      },
      resolve: null,
      text: "Whenever a source an opponent controls deals damage to this creature, that source's controller loses that much life unless they sacrifice that many permanents of their choice.",
    },
  ],
});
