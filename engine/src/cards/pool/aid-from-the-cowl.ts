import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 11123.
//
// Rulings:
//   [2017-02-09] A permanent card is an artifact, creature, enchantment, land, or planeswalker
//     card.
//   [2017-02-09] If a permanent put onto the battlefield this way has an ability that triggers at
//     the beginning of your end step, it won't trigger during this end step.
//   [2017-02-09] Tokens that leave the battlefield will satisfy a revolt ability.
//   [2017-02-09] Revolt abilities check only whether a permanent you controlled left the
//     battlefield this turn or not. They don't apply multiple times if more than one permanent you
//     controlled left the battlefield. They don't check whether the permanent that left the
//     battlefield is still in the zone it moved to.
//   [2017-02-09] If the revealed card is not a permanent card or if you choose not to put it onto
//     the battlefield, you may put it on the bottom of your library. If you don't, it remains on
//     top of your library.
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
//   [2017-02-09] Energy counters aren't permanents. Paying {E} won't satisfy a revolt ability.
// Lurking Predators' shape: a permanent card may go onto the battlefield (if
// not, it stays on top); any other card may go to the bottom.

const TEXT =
  "Revolt — At the beginning of your end step, if a permanent left the battlefield under your control this turn, reveal the top card of your library. If it's a permanent card, you may put it onto the battlefield. Otherwise, you may put it on the bottom of your library.";

export default defineCard({
  name: "Aid from the Cowl",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: REVOLT_CONDITION,
      effect: {
        kind: "reveal-top",
        then: {
          kind: "conditional",
          condition: {
            kind: "target",
            index: 0,
            filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
          },
          then: {
            kind: "may",
            prompt: "Put the revealed card onto the battlefield?",
            effect: { kind: "put-onto-battlefield", target: 0 },
          },
          else: {
            kind: "may",
            prompt: "Put the revealed card on the bottom of your library?",
            effect: { kind: "put-on-library", target: 0, position: "bottom" },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
