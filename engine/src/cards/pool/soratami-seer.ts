import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 21261. Soratami Mirror-Mage's
// land-bounce cost with Tolarian Winds' effect.

const TEXT =
  "{4}, Return two lands you control to their owner's hand: Discard all the cards in your hand, then draw that many cards.";

export default defineCard({
  name: "Soratami Seer",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false, returnToHand: { count: 2, filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: { thisWay: "discarded" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
