import { defineCard } from "../define.js";

const CAST_TEXT = "When you cast this spell, destroy target permanent.";
const ANNIHILATOR_TEXT =
  "Annihilator 4 (Whenever this creature attacks, defending player sacrifices four permanents of their choice.)";
const SHUFFLE_TEXT =
  "When Ulamog is put into a graveyard from anywhere, its owner shuffles their graveyard into their library.";

export default defineCard({
  name: "Ulamog, the Infinite Gyre",
  manaCost: "{11}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 10,
  toughness: 10,
  keywords: ["indestructible"],
  text: `${CAST_TEXT}\nIndestructible\n${ANNIHILATOR_TEXT}\n${SHUFFLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["permanent"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: {}, count: 4 },
      resolve: null,
      text: "Annihilator 4",
    },
    {
      // Worldspine Wurm's shape: a graveyard ability, controlled by the card's
      // owner — so "you" is its owner, whose whole graveyard (Ulamog in it) goes.
      trigger: { on: "put-into-graveyard", who: "self" },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "shuffle-graveyard-into-library", target: "you" },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
