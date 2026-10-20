import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 18685.
//
// "You own a card in exile" is Howling Galefang's `cards-in-exile`
// condition (tokens aren't cards), here gating the activation.

const UNBLOCKABLE_TEXT =
  "{3}{U}{U}: This creature can't be blocked this turn. Activate only if you own a card in exile.";

export default defineCard({
  name: "Dreadlight Monstrosity",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab", "Horror"],
  power: 5,
  toughness: 5,
  text: `Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n${UNBLOCKABLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      condition: { kind: "cards-in-exile", atLeast: 1, filter: { ownedBy: "you" } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
  ],
  triggered: [ward({ mana: "{2}" })],
});
