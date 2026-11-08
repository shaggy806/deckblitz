import { defineCard } from "../define.js";

// EDHREC rank 3996. Hexproof from monocolored: not from a multicoloured or a
// colourless source (Guardian of the Guildpact's filter: `colorless: false`
// is one or more colours).

const HEXPROOF_TEXT = "Hexproof from monocolored";
const CAST_TEXT = "Whenever you cast a multicolored spell, create a 4/4 red and white Golem artifact creature token.";

export default defineCard({
  name: "General Ferrous Rokiric",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 1,
  text: `${HEXPROOF_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { filter: { multicolored: false, colorless: false } },
      text: HEXPROOF_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: { kind: "create-token", token: "Golem Token (Red White 4/4)", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
