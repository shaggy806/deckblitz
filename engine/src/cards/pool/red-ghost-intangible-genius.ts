import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 12544. Marvel Super Heroes Commander.

const UNBLOCKABLE_TEXT = "Red Ghost can't be blocked.";
const APE_TEXT =
  "Whenever you draw your second card each turn, create a 3/3 red Ape Villain creature token with haste.";

export default defineCard({
  name: "Red Ghost, Intangible Genius",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 2,
  toughness: 3,
  text: `Ward {2}\n${UNBLOCKABLE_TEXT}\n${APE_TEXT}`,
  static: [{ affects: { scope: "self" }, grantKeywords: ["unblockable"], text: UNBLOCKABLE_TEXT }],
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Ape Villain Token", count: 1 },
      resolve: null,
      text: APE_TEXT,
    },
  ],
});
