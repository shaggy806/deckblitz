import { defineCard } from "../define.js";

// Throne of Eldraine (ELD). The free cast is asked as it's cast (rule
// 601.2b): no spell of yours cast yet this game (`first-spell-this-game`).

const FREE_TEXT = "If this spell is the first spell you've cast this game, you may cast it without paying its mana cost.";
const LOOK_TEXT =
  "Look at the top five cards of your library. You may reveal a creature or land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Once Upon a Time",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `${FREE_TEXT}\n${LOOK_TEXT}`,
  freeCastIf: { condition: { kind: "first-spell-this-game" } },
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { typesAnyOf: ["creature", "land"] },
    destination: "hand",
    leftover: "bottom-random",
  },
});
