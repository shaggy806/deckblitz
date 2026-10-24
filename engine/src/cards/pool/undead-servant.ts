import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 29560.
//
// Rulings:
//   [2015-06-22] Count the Undead Servants in your graveyard as the ability resolves. If Undead
//     Servant dies in response to its own triggered ability, it counts.
//
// Counted as it resolves, cards you own in your graveyard named Undead
// Servant (`ownedBy: "you"` keeps it to your own graveyard).
const ETB_TEXT =
  "When this creature enters, create a 2/2 black Zombie creature token for each card named Undead Servant in your graveyard.";

export default defineCard({
  name: "Undead Servant",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Zombie Token",
        count: { countInGraveyard: { name: "Undead Servant", ownedBy: "you" } },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
