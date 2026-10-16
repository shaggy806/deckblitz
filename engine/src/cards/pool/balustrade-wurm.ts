import { defineCard } from "../define.js";

// EDHREC rank 12811.
// Gastal Thrillroller's return from the graveyard, gated on delirium (the
// card itself counts toward it from there) and sorcery timing.
const RETURN =
  "Delirium — {2}{G}{G}: Return this card from your graveyard to the battlefield with a finality counter on it. Activate only if there are four or more card types among cards in your graveyard and only as a sorcery.";

export default defineCard({
  name: "Balustrade Wurm",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 5,
  toughness: 5,
  keywords: ["trample", "haste"],
  cantBeCountered: true,
  text: `This spell can't be countered.\nTrample, haste\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "delirium" },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: RETURN,
    },
  ],
});
