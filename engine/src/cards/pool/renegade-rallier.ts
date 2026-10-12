import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 15562.
//
// Rulings:
//   [2017-02-09] A permanent card is an artifact, creature, enchantment, land, or planeswalker
//     card.
//   [2017-02-09] Tokens that leave the battlefield will satisfy a revolt ability.
//   [2017-02-09] If the mana cost of a card in your graveyard includes {X}, X is considered to be
//     0.
//   [2017-02-09] All cards in the Aether Revolt set with triggered revolt abilities use an
//     intervening "if" clause. A permanent you controlled must have left the battlefield earlier
//     in the turn in order for these abilities to trigger; otherwise they do nothing. In other
//     words, there's no way to have the ability trigger if no permanent you controlled has left
//     the battlefield that turn, even if you intend to have one do so in response to the triggered
//     ability.
//   [2017-02-09] Revolt abilities don't care why the permanent left the battlefield, who caused it
//     to move, or where it moved to. They're equally satisfied by an artifact you sacrificed to
//     pay a cost, a creature you controlled that was destroyed by Murder, or an enchantment you
//     returned to your hand with Leave in the Dust.
//   [2017-02-09] The mana value of a card in your graveyard is determined solely by the mana
//     symbols printed in its upper right corner. The mana value is the total amount of mana in
//     that cost, regardless of color. For example, a card with mana cost {1}{U}{U} has mana value
//     3.
//   [2017-02-09] Revolt abilities check only whether a permanent you controlled left the
//     battlefield this turn or not. They don't apply multiple times if more than one permanent you
//     controlled left the battlefield. They don't check whether the permanent that left the
//     battlefield is still in the zone it moved to.
//   [2017-02-09] If a card in your graveyard has no mana symbols in its upper right corner
//     (because it's a land card, for example), its mana value is 0.
//   [2017-02-09] You can target any permanent card in your graveyard with mana value 2 or less,
//     not just one that was put there from the battlefield this turn.
//   [2017-02-09] Energy counters aren't permanents. Paying {E} won't satisfy a revolt ability.
const TEXT =
  "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, return target permanent card with mana value 2 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Renegade Rallier",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
            manaValue: { op: "lte", n: 2 },
          },
        },
      ],
      condition: REVOLT_CONDITION,
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
