import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// EDHREC rank 23543.
//
// Rulings:
//   Spiritmonger's last ability causes it to become only the chosen color. It will no longer be
//     the colors it was previously.

const DAMAGE = "Whenever this creature deals damage to a creature, put a +1/+1 counter on this creature.";
const REGEN = "{B}: Regenerate this creature.";
const COLOR = "{G}: This creature becomes the color of your choice until end of turn.";

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: { kind: "become-color", target: "source", colors: [color], duration: "end-of-turn" },
}));

export default defineCard({
  name: "Spiritmonger",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  text: `${DAMAGE}\n${REGEN}\n${COLOR}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DAMAGE,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN,
    },
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: MODES,
      },
      resolve: null,
      text: COLOR,
    },
  ],
});
