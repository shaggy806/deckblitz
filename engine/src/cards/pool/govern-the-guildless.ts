import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// Dissension (DIS). EDHREC rank 23227.
//
// "The color or colors of your choice": Scuttlemutt's shape — one mode per
// non-empty combination of the five colours, chosen as the ability resolves.
const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];
const MODES: ModeOption[] = Array.from({ length: 31 }, (_, i) => i + 1)
  .map((mask) => COLORS.filter((_, bit) => (mask & (1 << bit)) !== 0))
  .sort((x, y) => x.length - y.length)
  .map((picked) => ({
    text: picked.map(([, word]) => word).join(", "),
    effect: { kind: "become-color", target: 0, colors: picked.map(([color]) => color), duration: "end-of-turn" },
  }));

export default defineCard({
  name: "Govern the Guildless",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Gain control of target monocolored creature.\nForecast — {1}{U}, Reveal this card from your hand: Target creature becomes the color or colors of your choice until end of turn. (Activate only during your upkeep and only once each turn.)",
  targets: [
    {
      kind: "permanent",
      filter: {
        type: "creature",
        multicolored: false,
        anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }],
      },
    },
  ],
  effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
  activated: [
    forecast({
      cost: { mana: "{1}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: "Forecast — {1}{U}, Reveal this card from your hand: Target creature becomes the color or colors of your choice until end of turn. (Activate only during your upkeep and only once each turn.)",
    }),
  ],
});
