import { defineCard } from "../define.js";

// Torment. EDHREC rank 30406.

const TEXT = "{T}, Exile three cards from your graveyard: Target player loses 3 life.";

export default defineCard({
  name: "Organ Grinder",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: 3 } },
      targets: ["player"],
      effect: { kind: "lose-life", amount: 3, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
