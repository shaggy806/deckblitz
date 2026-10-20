import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). "Permanent card" as Angel of Indemnity's filter:
// anything but an instant or sorcery card, a land included.
const TEXT =
  "When this creature enters, return target permanent card with mana value 3 or less from your graveyard to your hand.";

export default defineCard({
  name: "Disciple of the Sun",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
