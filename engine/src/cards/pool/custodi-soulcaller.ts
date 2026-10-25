import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// X is the number of players attacked with creatures this combat — melee's
// count (`opponentsAttacked`), read as the target is chosen and again as the
// ability resolves.

const ATTACK_TEXT =
  "Whenever this creature attacks, return target creature card with mana value X or less from your graveyard to the battlefield, where X is the number of players you attacked this combat.";

export default defineCard({
  name: "Custodi Soulcaller",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: `Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)\n${ATTACK_TEXT}`,
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
      text: ATTACK_TEXT,
    },
  ],
});
