import { defineCard } from "../define.js";

export default defineCard({
  name: "Battle Plan",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  cycling: { cost: "{1}{R}", search: { supertype: "basic", type: "land" } },
  text: "At the beginning of combat on your turn, target creature you control gets +2/+0 until end of turn.\nBasic landcycling {1}{R} ({1}{R}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "At the beginning of combat on your turn, target creature you control gets +2/+0 until end of turn.",
    },
  ],
});
