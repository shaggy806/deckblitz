import { defineCard } from "../define.js";

// Rulings:
//   In a multiplayer game, it triggers once for each player you attack with at least two creatures.
//   They must attack the same player: creatures attacking that player's planeswalkers or battles
//     don't count.

const TEXT =
  "Whenever two or more creatures you control attack a player, look at the top five cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Horn of the Mark",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "any", atLeast: 2 },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
