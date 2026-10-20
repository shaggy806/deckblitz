import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 19148.
const TEXT =
  "{2}{G}, {T}, Exile a creature card from your graveyard: Put two +1/+1 counters on target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Littjara Glade-Warden",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  keywords: ["changeling"],
  text: `Changeling (This card is every creature type.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
