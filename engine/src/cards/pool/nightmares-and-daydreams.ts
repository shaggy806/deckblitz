import { defineCard } from "../define.js";

// Each of chapters I-III sets up its own delayed "whenever" (rule 603.7c),
// lasting until your next turn begins; its target player is chosen each time
// it triggers, and the spell's mana value is read off the spell as cast.
const WATCH_TEXT =
  "Until your next turn, whenever you cast an instant or sorcery spell, target player mills cards equal to that spell's mana value.";
const CHAPTER_IV = "IV — Draw a card. If a graveyard has twenty or more cards in it, draw three cards instead.";

export default defineCard({
  name: "Nightmares and Daydreams",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\nI, II, III — ${WATCH_TEXT}\n${CHAPTER_IV}`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
          until: "until-your-next-turn",
          targets: ["player"],
        },
        effect: { kind: "mill", target: 0, amount: { manaValueOf: "trigger-object" } },
        text: "Whenever you cast an instant or sorcery spell, target player mills cards equal to that spell's mana value.",
      },
      resolve: null,
      text: `I, II, III — ${WATCH_TEXT}`,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", whose: "any-player", atLeast: 20 },
        then: { kind: "draw", amount: 3 },
        else: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: CHAPTER_IV,
    },
  ],
});
