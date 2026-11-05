import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever Mirko Vosk deals combat damage to a player, that player reveals cards from the top of their library until they reveal four land cards, then puts those cards into their graveyard.";

export default defineCard({
  name: "Mirko Vosk, Mind Drinker",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "trigger-player",
        effect: {
          kind: "reveal-until-count",
          whose: "that-player",
          filter: { type: "land" },
          count: 4,
          put: "with-rest",
          rest: "graveyard",
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
