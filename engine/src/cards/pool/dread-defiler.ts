import { defineCard } from "../define.js";

const TEXT =
  "{3}{C}, Exile a creature card from your graveyard: Target opponent loses life equal to the exiled card's power. ({C} represents colorless mana.)";

export default defineCard({
  name: "Dread Defiler",
  manaCost: "{6}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 6,
  toughness: 8,
  text: `Devoid (This card has no color.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{C}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: ["opponent"],
      effect: { kind: "lose-life", target: 0, amount: { powerOf: { paid: "exiled" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
