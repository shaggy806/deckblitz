import { defineCard } from "../define.js";

// The creatures that get +1/+0 are fixed as the ability resolves (rule
// 611.2c): one that gains flying afterwards doesn't get the bonus.
const PUMP_TEXT =
  "{1}{B}{B}: Each creature you control with flying, deathtouch, and/or lifelink gets +1/+0 until end of turn.";

export default defineCard({
  name: "Henrika, Infernal Seer",
  art: "https://cards.scryfall.io/art_crop/back/9/4/946ca338-5f43-4cff-bd93-1b28449c5fdc.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "deathtouch", "lifelink"],
  text: `Flying, deathtouch, lifelink\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}{B}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: {
          type: "creature",
          controlledBy: "you",
          anyOf: [{ keyword: "flying" }, { keyword: "deathtouch" }, { keyword: "lifelink" }],
        },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  faces: ["Henrika Domnathi", "Henrika, Infernal Seer"],
  transform: true,
});
