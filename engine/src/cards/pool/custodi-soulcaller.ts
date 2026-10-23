import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// X is read from the players attacked as attackers were declared this combat
// (`opponentsAttacked`, rule 702.121a's count), so it holds even if the
// attackers leave combat before the trigger resolves — the card's ruling.
const MELEE_TEXT =
  "Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)";
const RETURN_TEXT =
  "Whenever this creature attacks, return target creature card with mana value X or less from your graveyard to the battlefield, where X is the number of players you attacked this combat.";

export default defineCard({
  name: "Custodi Soulcaller",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: `${MELEE_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    melee(),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: { amount: { opponentsAttacked: true } } } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
