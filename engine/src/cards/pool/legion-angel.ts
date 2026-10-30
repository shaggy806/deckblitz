import { defineCard } from "../define.js";

// EDHREC rank 25834. Zendikar Rising.
//
// Another Legion Angel from the controller's sideboard (rule 400.11a); none
// in a Commander game (903.5e).

export default defineCard({
  name: "Legion Angel",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you may reveal a card you own named Legion Angel from outside the game and put it into your hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Legion Angel" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
        outside: "only",
      },
      resolve: null,
      text: "When this creature enters, you may reveal a card you own named Legion Angel from outside the game and put it into your hand.",
    },
  ],
});
