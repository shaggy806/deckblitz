import { defineCard } from "../define.js";

// EDHREC rank 11073. Secrets of Strixhaven Commander.
//
// Commander's Insignia's count, over Spirits only: every cast of each of
// your commanders from the command zone, a countered one included (the
// rulings). The return works only from the graveyard (rule 113.6k — Nether
// Traitor's shape); "this card" is the card only while it's the same object.
const ANTHEM_TEXT =
  "Spirits you control get +1/+1 for each time you've cast your commander from the command zone this game.";
const RETURN_TEXT =
  "Whenever a Spirit you control enters, you may pay {2}{W}. If you do, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Vanguard of the Restless",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ANTHEM_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Spirit" },
      grantPtPerCount: { commanderCasts: true, pt: [1, 1] },
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Spirit" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{W} to return Vanguard of the Restless to the battlefield?",
        cost: "{2}{W}",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
