import { defineCard } from "../define.js";

// "If an Aura you controlled was attached to it": the dying creature as it
// last existed (`enchantedBy` reads the leaving snapshot's attachments), a
// fact that can't change before the ability resolves.

const TRIGGER_TEXT =
  "Whenever a creature dies, if an Aura you controlled was attached to it, return target creature card with mana value 2 or less from your graveyard to your hand.";

export default defineCard({
  name: "Dawn Evangel",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", enchantedBy: "you" } },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
