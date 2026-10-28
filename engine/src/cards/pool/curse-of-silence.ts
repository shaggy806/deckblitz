import { defineCard } from "../define.js";

// EDHREC rank 11901.

const NAME = "As this Aura enters, choose a card name.";
const TAX = "Spells with the chosen name enchanted player casts cost {2} more to cast.";
const TRIGGER =
  "Whenever enchanted player casts a spell with the chosen name, you may sacrifice this Aura. If you do, draw a card.";

export default defineCard({
  name: "Curse of Silence",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${NAME}\n${TAX}\n${TRIGGER}`,
  targets: ["player"],
  chooseCardNameOnEnter: {},
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { chosenName: true }, caster: "enchanted-player", increaseGeneric: 2 },
      text: TAX,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "attached", filter: { chosenName: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Curse of Silence to draw a card?",
        effect: { kind: "sacrifice-source", then: { kind: "draw", amount: 1 } },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
