import { defineCard } from "../define.js";

// Dissension.
const DRAIN = "{B}, Sacrifice this creature: Target player loses 1 life and you gain 1 life.";
const RETURN = "Whenever you cast a multicolored spell, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Entropic Eidolon",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `${DRAIN}\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAIN,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Entropic Eidolon from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
