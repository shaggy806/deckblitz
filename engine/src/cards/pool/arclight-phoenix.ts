import { defineCard } from "../define.js";

// EDHREC rank 19339.
//
// Darklight Phoenix's shape: the return works only from the graveyard
// (rule 113.6k — `fromGraveyard`) and is mandatory; the spell count is an
// intervening if (rule 603.4), checked as combat begins and on resolution.
const RETURN_TEXT =
  "At the beginning of combat on your turn, if you've cast three or more instant and sorcery spells this turn, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Arclight Phoenix",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${RETURN_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] }, atLeast: 3 },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
