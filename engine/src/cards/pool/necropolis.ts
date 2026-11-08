import { defineCard } from "../define.js";

const TEXT =
  "Exile a creature card from your graveyard: Put X +0/+1 counters on this creature, where X is the exiled card's mana value.";

export default defineCard({
  name: "Necropolis",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 1,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+0/+1", amount: { manaValueOf: { paid: "exiled" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
