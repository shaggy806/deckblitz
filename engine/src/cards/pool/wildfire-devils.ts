import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters and at the beginning of your upkeep, choose a player at random. That player exiles an instant or sorcery card from their graveyard. Copy that card. You may cast the copy without paying its mana cost.";

/** The random player chooses the card (its ruling) — a `look-and-choose`
 * they answer, unlinked from this creature; the copy is cast from exile as
 * the ability resolves, or not at all. */
const EFFECT = {
  kind: "choose-opponent",
  random: true,
  anyPlayer: true,
  then: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        player: "that-player",
        zone: "graveyard",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        min: 1,
        max: 1,
        destination: "exile",
        unlinked: true,
        leftover: "stay",
      },
      { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
    ],
  },
} as const;

export default defineCard({
  name: "Wildfire Devils",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      sameAbilityAs: 0,
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
