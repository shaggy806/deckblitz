import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 6853.
//
// Rulings:
//   [2024-03-08] Once an artifact enters the battlefield under your control in a given turn, it
//     doesn't matter what happens to it later. A Knight token created by The Prydwen, Steel
//     Flagship's second ability will still get +2/+2 for the rest of that turn.
//
// Surge Conductor's trigger; the token's "+2/+2 as long as" reads the turn's
// history (Goddric's Celebration), so an artifact that has left still counts.
const TOKEN_TEXT =
  'Whenever another nontoken artifact you control enters, create a 2/2 white Human Knight creature token with "This token gets +2/+2 as long as an artifact entered the battlefield under your control this turn."';

export default defineCard({
  name: "The Prydwen, Steel Flagship",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TOKEN_TEXT}\n${crewText(2)}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, type: "artifact" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Human Knight Token (The Prydwen)", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  activated: [crew(2, crewText(2))],
});
