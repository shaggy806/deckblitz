import { defineCard } from "../define.js";
import type { EffectSpec, ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// EDHREC rank 14676.
// Rulings:
//   [2014-07-18] Both activated abilities prevent all damage of the chosen color, not just combat
//     damage.
//   [2014-07-18] For each activated ability, you choose the color as the ability resolves.
//     However, the color of a source that would deal damage to the permanent or player is checked
//     only when it would deal that damage, not as Avacyn's ability resolves.
//   [2014-07-18] The possible color choices are white, blue, black, red, and green.
//
// The colour is chosen as the ability resolves — an unannounced `modal`, one
// mode per colour (Alchor's Tomb's shape). Each mode is a `damage-rule` on
// the target whose source filter is asked as the damage would be dealt
// (rule 615.1), as the ruling says.

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

const byColorOfChoice: EffectSpec = {
  kind: "modal",
  minModes: 1,
  maxModes: 1,
  modes: COLORS.map(
    ([color, word]): ModeOption => ({
      text: word,
      effect: { kind: "damage-rule", to: { target: 0 }, by: { filter: { colors: [color] } } },
    }),
  ),
};

const CREATURE_TEXT =
  "{1}{W}: Prevent all damage that would be dealt to another target creature this turn by sources of the color of your choice.";
const PLAYER_TEXT =
  "{5}{W}{W}: Prevent all damage that would be dealt to target player or planeswalker this turn by sources of the color of your choice.";

export default defineCard({
  name: "Avacyn, Guardian Angel",
  manaCost: "{2}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${CREATURE_TEXT}\n${PLAYER_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: byColorOfChoice,
      resolve: null,
      text: CREATURE_TEXT,
    },
    {
      cost: { mana: "{5}{W}{W}", tap: false },
      targets: ["player-or-planeswalker"],
      effect: byColorOfChoice,
      resolve: null,
      text: PLAYER_TEXT,
    },
  ],
});
