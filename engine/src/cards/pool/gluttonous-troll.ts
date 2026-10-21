import { defineCard } from "../define.js";

// EDHREC rank 14367.
//
// Rulings:
//   [2019-10-04] In a multiplayer game, opponents who have left the game aren't counted by
//     Gluttonous Troll's triggered ability.
//   [2019-10-04] You can sacrifice a Food token created by Gluttonous Troll's triggered ability to
//     pay for the cost of its activated ability.

const ENTERS = "When this creature enters, create a number of Food tokens equal to the number of opponents you have.";
const PUMP = "{1}{G}, Sacrifice another nonland permanent: This creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Gluttonous Troll",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ENTERS} (Food tokens are artifacts with "{2}, {T}, Sacrifice this token: You gain 3 life.")\n${PUMP}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: { filter: { notTypes: ["land"] } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: { countPlayers: "each-opponent" } },
      resolve: null,
      text: ENTERS,
    },
  ],
});
