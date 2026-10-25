import { defineCard } from "../define.js";
import { dethrone } from "../helpers.js";

// Conspiracy (CNS). EDHREC rank 24407.

export default defineCard({
  name: "Marchesa's Smuggler",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: "Dethrone (Whenever this creature attacks the player with the most life or tied for most life, put a +1/+1 counter on it.)\n{1}{U}{R}: Target creature you control gains haste until end of turn and can't be blocked this turn.",
  triggered: [dethrone()],
  activated: [
    {
      cost: { mana: "{1}{U}{R}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{1}{U}{R}: Target creature you control gains haste until end of turn and can't be blocked this turn.",
    },
  ],
});
