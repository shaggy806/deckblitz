import { defineCard } from "../define.js";
import type { Keyword } from "../define.js";
import type { CardFilter } from "../../filter.js";

const COMBAT_TEXT =
  "At the beginning of each combat, until end of turn, each other creature you control gets +1/+1 if it has flying, " +
  "+1/+1 if it has first strike, and so on for double strike, deathtouch, haste, hexproof, indestructible, lifelink, " +
  "menace, protection, reach, trample, vigilance, and partner.";

// Rulings:
//   [2020-11-10] A creature with more than one of the listed keywords gets
//   +1/+1 for each of those keywords it has.
//   [2020-11-10] A creature with more than one instance of one of the listed
//   keywords gets just +1/+1 for that keyword. Similarly, if a creature has
//   multiple variants of the same keyword (e.g. protection from black and
//   from red), it gets just +1/+1 for that keyword.
//   [2020-11-10] Which creatures are affected and the size of their
//   individual bonuses is determined only as the triggered ability resolves.
//   [2020-11-10] It refers only to creatures with partner or "partner with"
//   abilities, not creatures with any other partner variant.
const has = (keyword: Keyword): CardFilter => ({ keyword });

// One filter a listed ability, in the text's order: hexproof and protection
// in any variant, and partner off the text box.
const LISTED: readonly CardFilter[] = [
  has("flying"),
  has("first-strike"),
  has("double-strike"),
  has("deathtouch"),
  has("haste"),
  { keywordVariant: "hexproof" },
  has("indestructible"),
  has("lifelink"),
  has("menace"),
  { keywordVariant: "protection" },
  has("reach"),
  has("trample"),
  has("vigilance"),
  { hasKeyword: "partner" },
];

export default defineCard({
  name: "Akroma, Vision of Ixidor",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "first-strike", "vigilance", "trample"],
  pairing: { kind: "partner" },
  text: `Flying, first strike, vigilance, trample\n${COMBAT_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
        exceptSource: true,
        perMatchOf: LISTED,
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
