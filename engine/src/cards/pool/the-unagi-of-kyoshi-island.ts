import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 2796. Ward with `waterbend`: the targeting player may tap their untapped artifacts and
// creatures for up to {4} of it (rule 701.67a), as the `choose-modes` decision's `costWaterbend`
// pays "unless you waterbend". The draw trigger is Faerie Mastermind's, two cards.
//
// Rulings:
//   "Waterbend [cost]" means "Pay [cost]. For each generic mana in that cost, you may tap an
//     untapped artifact or creature you control rather than pay that mana."
//   The last ability can trigger only once each turn for each opponent.
//   You can tap any untapped creature or artifact you control to pay a waterbend cost, even one
//     you haven't controlled continuously since the beginning of your most recent turn.

const WARD_TEXT =
  "Ward—Waterbend {4}. (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {4}. They can tap their artifacts and creatures to help. Each one pays for {1}.)";
const DRAW_TEXT = "Whenever an opponent draws their second card each turn, you draw two cards.";

export default defineCard({
  name: "The Unagi of Kyoshi Island",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 5,
  keywords: ["flash"],
  text: `Flash\n${WARD_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    { ...ward({ mana: "{4}", waterbend: true }), text: "Ward—Waterbend {4}." },
    {
      trigger: { on: "draws", who: "opponent", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
