import { defineCard } from "../define.js";

const UNBLOCKABLE_TEXT = "{U}, Sacrifice an Island: This creature can't be blocked this turn.";
const DRAW_TEXT = "{B}, Sacrifice a Swamp: You gain 1 life and draw a card.";
const RETURN_TEXT =
  "{U}{B}: Exile five target cards from an opponent's graveyard. Return this card from your graveyard to your hand. Activate only as a sorcery.";

export default defineCard({
  name: "Lochmere Serpent",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 7,
  toughness: 7,
  keywords: ["flash"],
  text: `Flash\n${UNBLOCKABLE_TEXT}\n${DRAW_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: { filter: { subtype: "Island" } } },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
    {
      cost: { mana: "{B}", tap: false, sacrifice: { filter: { subtype: "Swamp" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      // It moves this card out of the graveyard, so it works only there
      // (rule 113.6k).
      cost: { mana: "{U}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "opponent" },
          min: 5,
          max: 5,
          sameController: true,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0 } },
          { kind: "return-to-hand", target: "source", from: "graveyard" },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
});
