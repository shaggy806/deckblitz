import { defineCard } from "../define.js";

// EDHREC rank 28878.

export default defineCard({
  name: "Soratami Cloud Chariot",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "{2}: Target creature you control gains flying until end of turn.\n{2}: Prevent all combat damage that would be dealt to and dealt by target creature you control this turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target creature you control gains flying until end of turn.",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { target: 0 }, combat: true },
          { kind: "damage-rule", by: { target: 0 }, combat: true },
        ],
      },
      resolve: null,
      text: "{2}: Prevent all combat damage that would be dealt to and dealt by target creature you control this turn.",
    },
  ],
});
