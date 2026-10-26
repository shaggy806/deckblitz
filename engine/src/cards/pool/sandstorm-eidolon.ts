import { defineCard } from "../define.js";

// Dissension. The return works only while the card is already in the
// graveyard as the spell is cast (Bloodghast's shape).
const RETURN_TEXT = "Whenever you cast a multicolored spell, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Sandstorm Eidolon",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `{R}, Sacrifice this creature: Target creature can't block this turn.\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{R}, Sacrifice this creature: Target creature can't block this turn.",
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Sandstorm Eidolon from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
