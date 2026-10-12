import { defineCard } from "../define.js";

export default defineCard({
  name: "Demonic Dread",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\nTarget creature can't block this turn.",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
