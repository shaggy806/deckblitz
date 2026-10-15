import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this artifact enters, look at the top five cards of your library. You may reveal up to two creature cards from among them and put them into your hand. Put the rest on the bottom of your library in a random order.";
const SAC_TEXT =
  '{1}, {T}, Sacrifice this artifact: Create a Treasure token. (It\'s an artifact with "{T}, Sacrifice this token: Add one mana of any color.")';

export default defineCard({
  name: "Pictures of Spider-Man",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "{1}, {T}, Sacrifice this artifact: Create a Treasure token.",
    },
  ],
  triggered: [
    {
      // Casey Jones's reveal-and-keep, up to two creature cards.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 2,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
