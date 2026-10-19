import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// EDHREC rank 9265.
//
// Squad's tokens are copies of this card (`create-token-copy`): each flies and
// draws on its own combat damage.
const SQUAD_TEXT =
  "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)";
const FIRE_TEXT = "Suppressing Fire — Whenever this creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Vanguard Suppressor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: `${SQUAD_TEXT}\nFlying\n${FIRE_TEXT}`,
  triggered: [
    squadTrigger(),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: FIRE_TEXT,
    },
  ],
});
