import { defineCard } from "../define.js";

// EDHREC rank 21901.
//
// The life loss counts the creature cards in your graveyard as the ability
// resolves.
const MILL_TEXT = "When Black Widow enters, mill three cards. (Put the top three cards of your library into your graveyard.)";
const DRAIN_TEXT =
  "Whenever Black Widow deals combat damage to a player, each opponent loses life equal to the number of creature cards in your graveyard.";

export default defineCard({
  name: "Black Widow, Daring Operative",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${MILL_TEXT}\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: MILL_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "lose-life",
        amount: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        who: "each-opponent",
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
