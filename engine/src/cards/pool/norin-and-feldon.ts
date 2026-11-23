import { defineCard } from "../define.js";

// Feldon of the Third Path's shape, with the token's own leave clause as a
// granted ability: "whenever a player casts a spell or a creature attacks" is
// one ability with two trigger events, written as one entry per event.

const ABILITY =
  "{2}{R}, {T}: Create a token that's a copy of target creature card in your graveyard, except it's an artifact in addition to its other types, gains haste, and has \"Whenever a player casts a spell or a creature attacks, exile this token.\" Activate only as a sorcery.";
const EXILE_TEXT = "Whenever a player casts a spell or a creature attacks, exile this token.";

export default defineCard({
  name: "Norin and Feldon",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Artificer"],
  power: 2,
  toughness: 2,
  text: ABILITY,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        asCard: true,
        exceptions: { addTypes: ["artifact"] },
        gains: {
          keywords: ["haste"],
          triggered: [
            {
              trigger: { on: "cast-spell", who: "any" },
              targets: [],
              effect: { kind: "exile", target: "source" },
              resolve: null,
              text: EXILE_TEXT,
            },
            {
              trigger: { on: "attacks", who: "any" },
              targets: [],
              effect: { kind: "exile", target: "source" },
              resolve: null,
              text: EXILE_TEXT,
            },
          ],
        },
      },
      resolve: null,
      text: ABILITY,
      sorcerySpeed: true,
    },
  ],
});
