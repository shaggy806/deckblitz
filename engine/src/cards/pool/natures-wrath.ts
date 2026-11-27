import { defineCard } from "../define.js";

// Alliances. "Whenever a player puts …" is who put it onto the battlefield
// (`putBy`): the player playing it, the controller of the spell or ability
// resolving, a token's creator — and "that player" is them. They choose the
// permanent as the ability resolves (not a target); the one that just entered
// may be it.

const UPKEEP = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {G}.";
const BLUE =
  "Whenever a player puts an Island or blue permanent onto the battlefield, that player sacrifices an Island or blue permanent of their choice.";
const BLACK =
  "Whenever a player puts a Swamp or black permanent onto the battlefield, that player sacrifices a Swamp or black permanent of their choice.";

const ISLAND_OR_BLUE = { anyOf: [{ subtype: "Island" }, { colors: ["U"] }] } as const;
const SWAMP_OR_BLACK = { anyOf: [{ subtype: "Swamp" }, { colors: ["B"] }] } as const;

export default defineCard({
  name: "Nature's Wrath",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: [UPKEEP, BLUE, BLACK].join("\n"),
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{G}", text: "Pay {G}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "enters-battlefield", who: "any", putBy: "any", filter: ISLAND_OR_BLUE },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: ISLAND_OR_BLUE, count: 1 },
      resolve: null,
      text: BLUE,
    },
    {
      trigger: { on: "enters-battlefield", who: "any", putBy: "any", filter: SWAMP_OR_BLACK },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: SWAMP_OR_BLACK, count: 1 },
      resolve: null,
      text: BLACK,
    },
  ],
});
