import { defineCard } from "../define.js";

// EDHREC rank 13641. Hexproof from monocolored is General Ferrous Rokiric's
// (exactly one color: neither multicolored nor colorless). The granted
// jump-start (rule 702.133a) is a printed one's shape — Radical Idea's
// `flashback: { cost, discard: 1, keyword: "jump-start" }` — given through
// `grantsToGraveyard.flashback`, the cost each card's own mana cost: cast from
// the graveyard at its usual timing, a card discarded beside it, exiled as it
// leaves the stack.
//
// Rulings:
//   You must still follow any timing restrictions and permissions, including those based on the
//     card's type. For instance, you can cast a sorcery using jump-start only when you could
//     normally cast a sorcery.
//   If an effect allows you to pay an alternative cost rather than a spell's mana cost, you may
//     pay that alternative cost when you jump-start a spell. You'll still discard a card as an
//     additional cost to cast it.
//   A spell cast using jump-start will always be exiled afterward, whether it resolves, it's
//     countered, or it leaves the stack in some other way.

const HEXPROOF_TEXT = "hexproof from monocolored";
const GRANT_TEXT = "Each instant and sorcery card in your graveyard that's exactly two colors has jump-start.";
const REMINDER =
  "(You may cast that card from your graveyard by discarding a card in addition to paying its other costs. Then exile it.)";

export default defineCard({
  name: "Niv-Mizzet, Supreme",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Avatar"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying, ${HEXPROOF_TEXT}\n${GRANT_TEXT} ${REMINDER}`,
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { filter: { multicolored: false, colorless: false } },
      text: HEXPROOF_TEXT,
    },
    {
      affects: { scope: "self" },
      grantsToGraveyard: {
        filter: { typesAnyOf: ["instant", "sorcery"], colorCount: 2 },
        flashback: { cost: "mana-cost", keyword: "jump-start", discard: 1 },
      },
      text: GRANT_TEXT,
    },
  ],
});
