import { defineCard } from "../define.js";

// A nontoken creature that would die is exiled instead with a blood counter
// (rule 700.4 — "dies" is battlefield to graveyard; a token still dies), the
// counter put on as it arrives, not by an effect. Rayami has each listed
// keyword some exiled creature card with a blood counter has — whoever owns it
// and whatever put the counter there (`sharesKeywords.from: { exile }`) —
// with every protection ability among them (702.16a) and their "hexproof
// from" variants (702.11d-e).

const REPLACE_TEXT = "If a nontoken creature would die, exile that card with a blood counter on it instead.";
const KEYWORDS_TEXT =
  "As long as an exiled creature card with a blood counter on it has flying, Rayami has flying. The same is true for first strike, double strike, deathtouch, haste, hexproof, indestructible, lifelink, menace, protection, reach, trample, and vigilance.";

export default defineCard({
  name: "Rayami, First of the Fallen",
  manaCost: "{1}{B}{G}{U}",
  colors: ["B", "G", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Vampire"],
  power: 5,
  toughness: 4,
  text: `${REPLACE_TEXT}\n${KEYWORDS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", token: false },
        withCounters: { kind: "blood", amount: 1 },
      },
      text: REPLACE_TEXT,
    },
    {
      affects: { scope: "self" },
      sharesKeywords: {
        from: { exile: { type: "creature", counters: { kind: "blood", compare: { op: "gte", n: 1 } } } },
        keywords: [
          "flying",
          "first-strike",
          "double-strike",
          "deathtouch",
          "haste",
          "hexproof",
          "indestructible",
          "lifelink",
          "menace",
          "reach",
          "trample",
          "vigilance",
        ],
        protection: true,
      },
      text: KEYWORDS_TEXT,
    },
  ],
});
