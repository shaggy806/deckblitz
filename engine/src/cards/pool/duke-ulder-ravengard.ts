import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

// EDHREC rank 6989.
//
// Rulings:
//   [2022-06-10] Any enters-the-battlefield abilities of the copied creature will trigger when the
//     tokens enter the battlefield. Any “as [this permanent] enters the battlefield” or “[this
//     permanent] enters the battlefield with” abilities of the copied creature will also work.
//   [2022-06-10] If myriad creates more than one token for any given player (due to an effect such
//     as the one Doubling Season creates), you may choose separately for each token whether it’s
//     attacking the player or a planeswalker they control.
//   [2022-06-10] Each token copies exactly what was printed on the original creature and nothing
//     else. It doesn’t copy whether that creature is tapped or untapped, whether it has any
//     counters on it or Auras and Equipment attached to it, or any non-copy effects that have
//     changed its power, toughness, types, color, and so on.
//   [2022-06-10] If the defending player is your only opponent, no tokens are put onto the
//     battlefield.
//   [2022-06-10] Although the tokens enter the battlefield attacking, they were never declared as
//     attackers. Abilities that trigger whenever a creature attacks won’t trigger, including the
//     myriad ability of the tokens. If there are any costs to have a creature attack, those costs
//     won’t apply to the tokens.
//   [2022-06-10] The tokens all enter the battlefield at the same time.
//
// Mass of Mysteries' grant: the `myriad` helper's trigger on the target until
// end of turn — its copies are of that creature, and a granted ability isn't
// copied (rule 707.2) — beside haste.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, another target creature you control gains haste and myriad until end of turn. (Whenever it attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)";

export default defineCard({
  name: "Duke Ulder Ravengard",
  manaCost: "{4}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Soldier"],
  power: 5,
  toughness: 5,
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          { kind: "grant-triggered", target: 0, ability: myriad(), duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
