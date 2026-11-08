import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import { encoreAbility } from "../helpers.js";

/** "Discard a card or sacrifice a permanent", the choice of whoever this runs as. */
const DISCARD_OR_SACRIFICE: EffectSpec = {
  kind: "modal",
  minModes: 1,
  maxModes: 1,
  modes: [
    { text: "Discard a card", effect: { kind: "discard", target: "you", amount: 1 } },
    { text: "Sacrifice a permanent", effect: { kind: "sacrifice", who: "you", filter: { controlledBy: "you" }, count: 1 } },
  ],
};

const TRIGGER_TEXT =
  "Whenever this creature attacks, you and defending player each discard a card or sacrifice a permanent. You draw a card for each land card put into a graveyard this way.";

export default defineCard({
  name: "Eumidian Wastewaker",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Cleric"],
  power: 4,
  toughness: 4,
  text: `${TRIGGER_TEXT}\nEncore {6}{B}{B} ({6}{B}{B}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          DISCARD_OR_SACRIFICE,
          { kind: "as-player", who: "that-player", effect: DISCARD_OR_SACRIFICE },
          {
            kind: "draw",
            amount: { sum: [{ thisWay: "discarded", who: "each-player", filter: { type: "land" } }, { thisWay: "sacrificed", who: "each-player", filter: { type: "land", token: false } }] },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [encoreAbility("{6}{B}{B}")],
});
