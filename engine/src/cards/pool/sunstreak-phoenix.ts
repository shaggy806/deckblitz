import { defineCard } from "../define.js";

// EDHREC rank 21147.
//
// Rulings:
//   [2021-09-24] If a triggered ability triggers whenever day becomes night or night becomes day,
//     it only triggers if it was already either day/night and becomes the other. It does not
//     trigger when the game becomes day or night for the first time.
//
// The return ability moves the card out of the graveyard, so it functions
// only there (rule 113.6k — `fromGraveyard`).
const RETURN_TEXT =
  "Whenever day becomes night or night becomes day, you may pay {1}{R}. If you do, return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Sunstreak Phoenix",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 4,
  toughness: 2,
  keywords: ["flying"],
  becomesDayAsEnters: true,
  text: `Flying\nIf it's neither day nor night, it becomes day as this creature enters.\n${RETURN_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "day-night-changes" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{R} to return Sunstreak Phoenix to the battlefield tapped?",
        cost: "{1}{R}",
        effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
