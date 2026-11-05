import { defineCard } from "../define.js";

// EDHREC rank 3504.
//
// Rulings:
//   [2023-04-14] The spell you cast from exile without paying its mana cost is cast during the
//     resolution of the triggered ability. Timing restrictions of that spell based on card type
//     are ignored.
//   [2023-04-14] The first ability of Rona, Herald of Invasion will resolve before the spell that
//     caused it to trigger.
//   [2023-04-14] Playing a legendary land won't cause the first ability to trigger.
//   [2023-04-14] If the spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2023-04-14] If you cast a spell without paying its mana cost, you can't choose to cast it for
//     any alternative costs. You can, however, pay any additional costs. If the spell has any
//     mandatory additional costs, you must pay those.
const UNTAP_TEXT = "Whenever you cast a legendary spell, untap Rona.";
const LOOT_TEXT = "{T}: Draw a card, then discard a card.";
const TRANSFORM_TEXT =
  "{5}{B/P}: Transform Rona. Activate only as a sorcery. ({B/P} can be paid with either {B} or 2 life.)";

export default defineCard({
  name: "Rona, Herald of Invasion",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${UNTAP_TEXT}\n${LOOT_TEXT}\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      cost: { mana: "{5}{B/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{5}{B/P}: Transform Rona. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { supertype: "legendary" } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
  faces: ["Rona, Herald of Invasion", "Rona, Tolarian Obliterator"],
  transform: true,
});
