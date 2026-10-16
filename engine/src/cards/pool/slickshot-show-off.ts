import { defineCard } from "../define.js";

// EDHREC rank 9394.

export default defineCard({
  name: "Slickshot Show-Off",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 1,
  toughness: 2,
  keywords: ["flying", "haste"],
  plot: { cost: "{1}{R}" },
  text: "Flying, haste\nWhenever you cast a noncreature spell, this creature gets +2/+0 until end of turn.\nPlot {1}{R} (You may pay {1}{R} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, this creature gets +2/+0 until end of turn.",
    },
  ],
});
