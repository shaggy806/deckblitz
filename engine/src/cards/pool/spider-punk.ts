import { defineCard } from "../define.js";

// EDHREC 3479 (batch 315). "Spells and abilities can't be countered" reaches
// every player's spells and every ability on the stack (`andAbilities`); a
// counterspell can still target them, and they just aren't countered (its
// ruling). Riot granted by a static works as a printed one (rule 702.136).
const RIOT_TEXT = "Riot (This creature enters with your choice of a +1/+1 counter or haste.)";
const SPIDERS_TEXT = "Other Spiders you control have riot.";
const COUNTER_TEXT = "Spells and abilities can't be countered.";
const PREVENT_TEXT = "Damage can't be prevented.";

export default defineCard({
  name: "Spider-Punk",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 2,
  toughness: 1,
  keywords: ["riot"],
  text: [RIOT_TEXT, SPIDERS_TEXT, COUNTER_TEXT, PREVENT_TEXT].join("\n"),
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Spider", controlledBy: "you" }, excludeSelf: true },
      grantKeywords: ["riot"],
      text: SPIDERS_TEXT,
    },
    {
      affects: { scope: "self" },
      grantsToSpells: { cantBeCountered: true, andAbilities: true, allSpells: true },
      text: COUNTER_TEXT,
    },
    { affects: { scope: "self" }, damageCantBePrevented: {}, text: PREVENT_TEXT },
  ],
});
