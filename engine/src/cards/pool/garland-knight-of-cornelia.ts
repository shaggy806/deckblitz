import { defineCard } from "../define.js";

// EDHREC rank 11692. The front face of a transforming card; its graveyard
// ability returns the card with its back face up (`transformed`, Edgar,
// Charmed Groom's return), Summoned Dromedary's graveyard-activation shape.
const SURVEIL_TEXT =
  "Whenever you cast a noncreature spell, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)";
const RETURN_TEXT =
  "{3}{B}{B}{R}{R}: Return this card from your graveyard to the battlefield transformed. Activate only as a sorcery.";

export default defineCard({
  name: "Garland, Knight of Cornelia",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 2,
  text: `${SURVEIL_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}{B}{R}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", transformed: true },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
  faces: ["Garland, Knight of Cornelia", "Chaos, the Endless"],
  transform: true,
});
