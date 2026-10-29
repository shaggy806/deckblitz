import { defineCard } from "../define.js";

// Rulings:
//   [2024-09-20] Putting a land card onto the battlefield with the last mode of Insidious Fungus's
//     ability doesn't count as playing a land. You can put a land card onto the battlefield even
//     if you've already played a land for the turn.

const MODAL_TEXT =
  "{2}, Sacrifice this creature: Choose one —\n• Destroy target artifact.\n• Destroy target enchantment.\n• Draw a card. Then you may put a land card from your hand onto the battlefield tapped.";

export default defineCard({
  name: "Insidious Fungus",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 1,
  toughness: 2,
  text: MODAL_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      // Its mode chosen as it's activated, bringing its target (rule 700.2b).
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Destroy target artifact.", targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
          { text: "Destroy target enchantment.", targets: ["enchantment"], effect: { kind: "destroy", target: 0 } },
          {
            text: "Draw a card. Then you may put a land card from your hand onto the battlefield tapped.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                {
                  kind: "look-and-choose",
                  zone: "hand",
                  min: 0,
                  max: 1,
                  destination: "battlefield",
                  enterTapped: true,
                  leftover: "stay",
                  filter: { type: "land" },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: MODAL_TEXT,
    },
  ],
});
