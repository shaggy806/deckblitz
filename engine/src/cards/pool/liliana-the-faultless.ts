import { defineCard } from "../define.js";

// EDHREC rank 8946.

const LIFE_TEXT = "Whenever another creature or planeswalker you control enters, you gain 1 life.";
const HEXPROOF_TEXT =
  "{1}, {T}, Discard a card: Another target creature or planeswalker you control gains hexproof until end of turn.";

export default defineCard({
  name: "Liliana the Faultless",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: `${LIFE_TEXT}\n${HEXPROOF_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true, discard: { count: 1 } },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", whose: "you", filter: { typesAnyOf: ["creature", "planeswalker"] } },
        },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: HEXPROOF_TEXT,
    },
  ],
});
