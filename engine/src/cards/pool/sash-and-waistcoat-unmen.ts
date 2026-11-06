import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 22996.

export default defineCard({
  name: "Sash and Waistcoat, Unmen",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect", "Rogue"],
  power: 2,
  toughness: 2,
  text: "Whenever a face-down creature attacks one of your opponents, it can't be blocked this combat.\n{3}: Manifest the top card of your library. Any player may activate this ability but only as a sorcery. (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: "{3}: Manifest the top card of your library. Any player may activate this ability but only as a sorcery.",
      anyPlayer: true,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "attacks",
        who: "any",
        filter: { faceDown: true, type: "creature", attackingOpponent: true },
      },
      targets: [],
      effect: {
        kind: "restrict",
        target: "trigger-object",
        restrictions: ["cant-be-blocked"],
        duration: "until-end-of-combat",
      },
      resolve: null,
      text: "Whenever a face-down creature attacks one of your opponents, it can't be blocked this combat.",
    },
  ],
});
