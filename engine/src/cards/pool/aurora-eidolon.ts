import { defineCard } from "../define.js";

// Dissension.
const PREVENT = "{W}, Sacrifice this creature: Prevent the next 3 damage that would be dealt to any target this turn.";
const RETURN = "Whenever you cast a multicolored spell, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Aurora Eidolon",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `${PREVENT}\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 3 },
      resolve: null,
      text: PREVENT,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Aurora Eidolon from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
