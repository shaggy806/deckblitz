import { defineCard } from "../define.js";

// The unearth granted is each artifact card's own activated ability (its
// rulings); ward is granted as Wondrous Crucible grants it.

const WARD_TEXT = 'Permanents you control have "Ward—Sacrifice a permanent."';
const UNEARTH_TEXT = "Each artifact card in your graveyard has unearth {1}{B}{R}.";

export default defineCard({
  name: "Mishra, Tamer of Mak Fawa",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 4,
  toughness: 4,
  text: `${WARD_TEXT}\n${UNEARTH_TEXT} ({1}{B}{R}: Return the card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
          targets: [],
          effect: { kind: "ward", cost: { sacrifice: { filter: {}, text: "Sacrifice a permanent" } } },
          resolve: null,
          text: "Ward—Sacrifice a permanent.",
        },
      ],
      text: WARD_TEXT,
    },
    {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { type: "artifact" }, keywords: [{ keyword: "unearth", cost: "{1}{B}{R}" }] },
      text: UNEARTH_TEXT,
    },
  ],
});
