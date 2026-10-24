import { defineCard } from "../define.js";

// EDHREC rank 18572.
//
// Landfall works only from the graveyard (the ruling: it triggers only if the
// Firebird is there as the land enters); the {4}{R}{R} is paid as it
// resolves — Silvan Reveler's paid `may`, Bloodghast's return.
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, you may pay {4}{R}{R}. If you do, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Akoum Firebird",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\nThis creature attacks each combat if able.\n${LANDFALL_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {4}{R}{R} to return Akoum Firebird to the battlefield?",
        cost: "{4}{R}{R}",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
