import { defineCard } from "../define.js";

const LEGEND_TEXT = 'The "legend rule" doesn\'t apply to Slivers you control.';
const ENCORE_TEXT = "Each Sliver creature card in your graveyard has encore {X}, where X is its mana value.";

export default defineCard({
  name: "Sliver Gravemother",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 6,
  toughness: 6,
  text: `${LEGEND_TEXT}\n${ENCORE_TEXT}\nEncore {5} ({5}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: "Encore {5} — Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver", controlledBy: "you" } },
      legendRuleOff: true,
      text: LEGEND_TEXT,
    },
    {
      affects: { scope: "self" },
      grantsToGraveyard: {
        filter: { type: "creature", subtype: "Sliver" },
        keywords: [{ keyword: "encore", cost: "mana-value" }],
      },
      text: ENCORE_TEXT,
    },
  ],
});
