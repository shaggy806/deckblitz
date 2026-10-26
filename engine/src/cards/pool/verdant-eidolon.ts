import { defineCard } from "../define.js";

const RETURN = "Whenever you cast a multicolored spell, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Verdant Eidolon",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `{G}, Sacrifice this creature: Add three mana of any one color.\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 3 },
      resolve: null,
      text: "{G}, Sacrifice this creature: Add three mana of any one color.",
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Verdant Eidolon from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
