import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 8239.
//
// Rulings:
//   [2006-07-15] Adarkar Valkyrie's ability can target a token creature, but since token creatures
//     cease to exist when they leave the battlefield, it won't be returned to the battlefield.

const ABILITY =
  "{T}: When target creature other than this creature dies this turn, return that card to the battlefield under your control.";

export default defineCard({
  name: "Adarkar Valkyrie",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ABILITY}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
        text: "When that creature dies this turn, return that card to the battlefield under your control.",
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
