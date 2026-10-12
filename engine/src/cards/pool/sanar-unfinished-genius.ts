import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Wild Idea, no card of
// its own (`wild-idea.ts`, `prepareSpellOnly`). The Treasure ability isn't a
// mana ability (it makes a token, not mana), and "you've cast an instant or
// sorcery spell this turn" counts one that was countered: it was cast.
const ENTERS_TEXT = `Sanar enters prepared. ${PREPARED_REMINDER}`;
const TREASURE_TEXT =
  "{T}: Create a Treasure token. Activate only if you've cast an instant or sorcery spell this turn.";

export default defineCard({
  name: "Sanar, Unfinished Genius",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Sorcerer"],
  power: 0,
  toughness: 4,
  prepareSpell: "Wild Idea",
  text: `${ENTERS_TEXT}\n${TREASURE_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      condition: { kind: "cast-this-turn", filter: { typesAnyOf: ["instant", "sorcery"] } },
      resolve: null,
      text: TREASURE_TEXT,
    },
  ],
});
