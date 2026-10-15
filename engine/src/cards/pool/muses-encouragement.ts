import { defineCard } from "../define.js";

// EDHREC rank 23049.
export default defineCard({
  name: "Muse's Encouragement",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Create a 3/3 blue and red Elemental creature token with flying.\nSurveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Elemental Token (3/3 Blue-Red Flying)", count: 1 },
      { kind: "surveil", amount: 2 },
    ],
  },
});
