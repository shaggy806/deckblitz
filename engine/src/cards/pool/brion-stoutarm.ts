import { defineCard } from "../define.js";

const SAC_TEXT =
  "{R}, {T}, Sacrifice another creature: Brion Stoutarm deals damage equal to the sacrificed creature's power to target player or planeswalker.";

export default defineCard({
  name: "Brion Stoutarm",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: true, sacrifice: { filter: { type: "creature", controlledBy: "you" } } },
      otherOnly: true,
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: { powerOf: "sacrificed" }, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
