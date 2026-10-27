import { defineCard } from "../define.js";

// EDHREC rank 17458. Torment.

export default defineCard({
  name: "Basking Rootwalla",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 1,
  toughness: 1,
  madness: { cost: "{0}" },
  text: "{1}{G}: This creature gets +2/+2 until end of turn. Activate only once each turn.\nMadness {0} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{G}: This creature gets +2/+2 until end of turn. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
