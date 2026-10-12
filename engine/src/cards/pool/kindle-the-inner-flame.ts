import { defineCard } from "../define.js";

// EDHREC rank 13100.
//
// Electroduplicate's copy: haste and the end-step sacrifice are copy
// exceptions (rule 707.9b), so a copy of the token has them too, and "the end
// step" is every player's. "Flashback—{1}{R}, Behold three Elementals"
// (rule 701.4a): three different Elementals, any mix of cards revealed from
// the hand and Elementals you control (the ruling) — tokens of one stack are
// each their own — chosen as the cost is paid, and castable that way only
// with three to behold. Sorcery timing still applies (the ruling).

const SACRIFICE_TEXT = "At the beginning of the end step, sacrifice this token.";
const COPY_TEXT = `Create a token that's a copy of target creature you control, except it has haste and "${SACRIFICE_TEXT}"`;

export default defineCard({
  name: "Kindle the Inner Flame",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["kindred", "sorcery"],
  subtypes: ["Elemental"],
  text: `${COPY_TEXT}\nFlashback—{1}{R}, Behold three Elementals. (You may cast this card from your graveyard for its flashback cost. Then exile it. To behold an Elemental, choose an Elemental you control or reveal an Elemental card from your hand.)`,
  flashback: {
    cost: "{1}{R}",
    behold: { filter: { subtype: "Elemental" }, text: "three Elementals", count: 3 },
  },
  targets: ["creature-you-control"],
  effect: {
    kind: "create-token-copy",
    of: 0,
    count: 1,
    who: "you",
    exceptions: {
      keywords: ["haste"],
      triggered: [
        {
          trigger: { on: "step-begins", step: "end", who: "any" },
          targets: [],
          effect: { kind: "sacrifice-source" },
          resolve: null,
          text: SACRIFICE_TEXT,
        },
      ],
    },
  },
});
