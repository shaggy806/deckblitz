import { defineCard } from "../define.js";

const TEXT =
  "Whenever Power Pack deals combat damage to a player, exile target instant or sorcery card from your graveyard chosen at random. At the beginning of your next upkeep, you may cast that card without paying its mana cost. If that spell would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Power Pack",
  manaCost: "{1}{R}{G}{W}{U}",
  colors: ["R", "G", "W", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance", "trample", "haste"],
  text: `Flying, vigilance, trample, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      targetsAtRandom: true,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "delayed-trigger",
            at: { step: "upkeep", whose: "you" },
            about: "exiled",
            effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
            text: "At the beginning of your next upkeep, you may cast that card without paying its mana cost. If that spell would be put into your graveyard, exile it instead.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
