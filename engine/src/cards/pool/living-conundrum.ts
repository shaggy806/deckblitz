import { defineCard } from "../define.js";

// Murders at Karlov Manor (MKM). EDHREC rank 18366.
//
// The skip is Obstinate Familiar's draw replaced by nothing, mandatory and only while the library
// is empty: no card is drawn, so no draw from an empty library is attempted (rule 704.5b). The
// drawing player orders it against the other replacements of that draw (rule 616.1): against
// another effect replacement by `optionalDrawReplacementAsked`, against an opponent's Notion Thief
// by `drawRedirectOrderAsked`. Against Laboratory Maniac's "win the game instead" the order
// changes nothing worth asking — the engine takes the win, and where the player can't win either
// one leaves the draw undone.
const SKIP_TEXT = "If you would draw a card while your library has no cards in it, skip that draw instead.";
const BIG_TEXT =
  "As long as there are no cards in your library, this creature has base power and toughness 10/10 and has flying and vigilance.";

export default defineCard({
  name: "Living Conundrum",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 5,
  keywords: ["hexproof"],
  text: `Hexproof\n${SKIP_TEXT}\n${BIG_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        whileLibraryEmpty: true,
        instead: { text: "skip that draw", effect: { kind: "sequence", effects: [] } },
      },
      text: SKIP_TEXT,
    },
    {
      // Layer 7b: counters and pumps still apply on top of the 10/10.
      affects: { scope: "self" },
      condition: { kind: "library-size", who: "you", atMost: 0 },
      setBasePt: { power: 10, toughness: 10 },
      grantKeywords: ["flying", "vigilance"],
      text: BIG_TEXT,
    },
  ],
});
