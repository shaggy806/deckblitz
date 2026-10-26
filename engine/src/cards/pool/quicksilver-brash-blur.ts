import { defineCard } from "../define.js";

// EDHREC rank 14661.

export default defineCard({
  name: "Quicksilver, Brash Blur",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  beginsOnBattlefield: true,
  text: "If Quicksilver, Brash Blur is in your opening hand, you may begin the game with him on the battlefield.\nHaste\nPower-up — {4}{R}: Put a +1/+1 counter and a double strike counter on Quicksilver. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)",
  activated: [
    {
      cost: { mana: "{4}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: "source", counter: "double-strike", amount: 1 },
        ],
      },
      resolve: null,
      text: "Power-up — {4}{R}: Put a +1/+1 counter and a double strike counter on Quicksilver. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)",
      powerUp: true,
    },
  ],
});
