import { defineCard } from "../define.js";

// EDHREC rank 1937. Chapter II is Kumano Faces Kakkazan's delayed "when you
// next cast a creature spell this turn" (rule 603.7), the counter put on as
// that creature enters (614.1c); chapter III is Triumph of Ferocity's check,
// made as it resolves.

const CHAPTER_I =
  "I — Crescent Fang — Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.";
const CHAPTER_II =
  "II — Heavenward Howl — When you next cast a creature spell this turn, that creature enters with an additional +1/+1 counter on it.";
const CHAPTER_III =
  "III — Ecliptic Growl — Draw a card if you control the creature with the greatest power or tied for the greatest power.";

export default defineCard({
  name: "Summon: Fenrir",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Wolf"],
  power: 3,
  toughness: 2,
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { type: "creature" } },
        effect: { kind: "enters-with-counters", target: "trigger-object", counter: "+1/+1", amount: 1 },
        text: "When you next cast a creature spell this turn, that creature enters with an additional +1/+1 counter on it.",
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls-greatest", of: "power", filter: { type: "creature" } },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
