import { defineCard } from "../define.js";

// "Spells that are one or more colors" isn't "colored cards" (the ruling): a
// colored permanent can block and its abilities can target Emrakul, and a colored
// Aura can be put onto the battlefield enchanting it, though no colored Aura spell
// can target it.

const CAST_TEXT = "When you cast this spell, take an extra turn after this one.";
const PROTECTION_TEXT = "Protection from spells that are one or more colors";
const ANNIHILATOR_TEXT =
  "Annihilator 6 (Whenever this creature attacks, defending player sacrifices six permanents of their choice.)";
const SHUFFLE_TEXT = "When Emrakul is put into a graveyard from anywhere, its owner shuffles their graveyard into their library.";

export default defineCard({
  name: "Emrakul, the Aeons Torn",
  manaCost: "{15}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 15,
  toughness: 15,
  keywords: ["flying"],
  cantBeCountered: true,
  text: `This spell can't be countered.\n${CAST_TEXT}\nFlying, protection from spells that are one or more colors, annihilator 6\n${SHUFFLE_TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { filter: { isSpell: true, colorless: false } }, text: PROTECTION_TEXT }],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: {}, count: 6 },
      resolve: null,
      text: ANNIHILATOR_TEXT,
    },
    {
      // Ulamog's shape: a graveyard ability, controlled by the card's owner.
      trigger: { on: "put-into-graveyard", who: "self" },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "shuffle-graveyard-into-library", target: "you" },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
