import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// Dauntless Cathar's graveyard ability (`zone: "graveyard"` makes exiling
// the card its cost).
const TEXT =
  '{1}{U}, Exile this card from your graveyard: Create a 1/1 blue Fish creature token with "This token can\'t be blocked." Activate only as a sorcery.';

export default defineCard({
  name: "Expendable Lackey",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "create-token", token: "Fish Token (Expendable Lackey)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
