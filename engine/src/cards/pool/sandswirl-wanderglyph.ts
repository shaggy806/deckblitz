import { defineCard } from "../define.js";

// - "They can't attack you or planeswalkers you control this turn" is a rule
//   for the rest of the turn over every creature that player controls, one
//   arriving later too (rule 611.2c), lasting though the Wanderglyph leaves
//   (its ruling); a battle you protect may still be attacked (its ruling).
//   "During their turn": that player's own turn (March of the World Ooze's
//   shape).
// - "Each opponent who attacked you or a planeswalker you control this turn
//   can't cast spells" reads who each attacker was declared at this turn (the
//   journal's attacks, a planeswalker as it was then), never a battle; once
//   the Wanderglyph has left, they can cast spells again (its rulings).
const ATTACK_TEXT =
  "Whenever an opponent casts a spell during their turn, they can't attack you or planeswalkers you control this turn.";
const CAST_TEXT = "Each opponent who attacked you or a planeswalker you control this turn can't cast spells.";

export default defineCard({
  name: "Sandswirl Wanderglyph",
  art: "https://cards.scryfall.io/art_crop/back/d/7/d70f48e7-582c-4dd2-a64e-6fd03fa6b77e.jpg",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      whileCondition: { kind: "of-player", player: "that-player", condition: { kind: "your-turn" } },
      targets: [],
      effect: {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "you" },
        sideOf: "trigger-controller",
        restrictions: [{ kind: "cant-attack", at: "you-and-planeswalkers" }],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: { who: "opponents", thisTurn: { stat: "attacked", against: "you" } } }],
      text: CAST_TEXT,
    },
  ],
  faces: ["Unstable Glyphbridge", "Sandswirl Wanderglyph"],
  transform: true,
});
