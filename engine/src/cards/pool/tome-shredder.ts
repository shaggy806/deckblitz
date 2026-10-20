import { defineCard } from "../define.js";

// EDHREC rank 25758.

const ACTIVATED_TEXT =
  "{T}, Exile an instant or sorcery card from your graveyard: Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Tome Shredder",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${ACTIVATED_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        exileFromGraveyard: { count: 1, filter: { typesAnyOf: ["instant", "sorcery"] } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
