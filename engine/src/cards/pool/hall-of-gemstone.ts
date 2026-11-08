import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";
import type { EffectSpec, ModeOption } from "../../effects.js";

// Mirage.
//
// Rulings:
//   [2004-10-04] Will not affect lands that do not produce mana.
//   [2004-10-04] Although the color may be altered, any restrictions on the use of the mana are not
//     removed.
//   [2016-08-23] Any colorless mana that's produced isn't affected.
//
// The active player chooses as the trigger resolves (`as-player` over a `modal`), and the effect
// lasts the turn with this gone: `manaProduction`'s `colorsOnly`, whoever taps any land.

const TEXT =
  "At the beginning of each player's upkeep, that player chooses a color. Until end of turn, lands tapped for mana produce mana of the chosen color instead of any other color.";

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

const modes: readonly ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: {
    kind: "player-effect",
    duration: "end-of-turn",
    manaProduction: { filter: { type: "land" }, produces: color, tapper: "any", colorsOnly: true },
  } satisfies EffectSpec,
}));

export default defineCard({
  name: "Hall of Gemstone",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "as-player",
        who: "active-player",
        effect: { kind: "modal", minModes: 1, maxModes: 1, modes },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
