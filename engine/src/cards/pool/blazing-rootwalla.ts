import { defineCard } from "../define.js";

export default defineCard({
  name: "Blazing Rootwalla",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 1,
  toughness: 1,
  madness: { cost: "{0}" },
  text: "{R}: This creature gets +2/+0 until end of turn. Activate only once each turn.\nMadness {0} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +2/+0 until end of turn. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
