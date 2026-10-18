import { defineCard } from "../define.js";

// EDHREC rank 16081.

const TEXT = "{B}, Exile this card from your graveyard: Incubate 2. Activate only as a sorcery.";

export default defineCard({
  name: "Ichor Drinker",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Vampire"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT} (Create an Incubator token with two +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "incubate", amount: 2 },
      resolve: null,
      text: TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
