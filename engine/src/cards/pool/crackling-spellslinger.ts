import { defineCard } from "../define.js";

// EDHREC rank 9208.
//
// Storm, Force of Nature's delayed "the next instant or sorcery spell you
// cast this turn has storm", behind an intervening "if you cast it" — from
// any zone, and not when it's put onto the battlefield (the ruling).
const ENTERS_TEXT =
  "When this creature enters, if you cast it, the next instant or sorcery spell you cast this turn has storm.";

export default defineCard({
  name: "Crackling Spellslinger",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ENTERS_TEXT} (When you cast that spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
        effect: { kind: "storm", of: "trigger-object" },
        text: "Storm",
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
