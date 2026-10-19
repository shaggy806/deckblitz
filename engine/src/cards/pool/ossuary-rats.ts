import { defineCard } from "../define.js";

// EDHREC rank 20905.
//
// X is counted as the trigger resolves.
const ENTER_TEXT =
  "When this creature enters, it deals X damage to target creature or planeswalker an opponent controls, where X is the number of creature cards in your graveyard.";

export default defineCard({
  name: "Ossuary Rats",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 3,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "damage",
        amount: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        target: 0,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
