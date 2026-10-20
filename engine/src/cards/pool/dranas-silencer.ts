import { defineCard } from "../define.js";

// EDHREC rank 25328.
//
// Rulings:
//   [2020-09-25] If an ability of a creature counts the number of creatures in your party, that
//     number is counted as the ability resolves. If that creature is still on the battlefield when
//     the ability resolves, it'll be counted if appropriate.
//   [2020-09-25] The value of X is determined only as Drana's Silencer's ability resolves. Once
//     that happens, the value of X won't change later in the turn even if the number of creatures
//     in your party changes.

const ENTER_TEXT =
  "When this creature enters, target creature an opponent controls gets -X/-X until end of turn, where X is the number of creatures in your party.";
const MINUS_X = { product: [{ partySize: "you" }, -1] } as const;

export default defineCard({
  name: "Drana's Silencer",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT} (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
