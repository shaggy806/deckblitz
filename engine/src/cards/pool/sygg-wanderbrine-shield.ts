import { defineCard } from "../define.js";

// The back face of Sygg, Wanderwine Wisdom.

const SHIELD_TEXT =
  "Whenever this creature transforms into Sygg, Wanderbrine Shield, target creature you control gains protection from each color until your next turn.";
const TRANSFORM_TEXT = "At the beginning of your first main phase, you may pay {U}. If you do, transform Sygg.";

export default defineCard({
  name: "Sygg, Wanderbrine Shield",
  art: "https://cards.scryfall.io/art_crop/back/7/0/70adc870-f0db-4d4b-863b-673c2c258751.jpg",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 2,
  text: `Sygg can't be blocked.\n${SHIELD_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { colors: ["W", "U", "B", "R", "G"] },
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: SHIELD_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {U} to transform Sygg?",
        cost: "{U}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "Sygg can't be blocked.",
    },
  ],
  faces: ["Sygg, Wanderwine Wisdom", "Sygg, Wanderbrine Shield"],
  transform: true,
});
