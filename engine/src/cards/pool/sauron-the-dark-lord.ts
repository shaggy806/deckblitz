import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const AMASS_TEXT = "Whenever an opponent casts a spell, amass Orcs 1.";
const TEMPT_TEXT = "Whenever an Army you control deals combat damage to a player, the Ring tempts you.";
const DISCARD_TEXT = "Whenever the Ring tempts you, you may discard your hand. If you do, draw four cards.";

export default defineCard({
  name: "Sauron, the Dark Lord",
  manaCost: "{3}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Horror"],
  power: 7,
  toughness: 6,
  text: `Ward—Sacrifice a legendary artifact or legendary creature.\n${AMASS_TEXT}\n${TEMPT_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    ward({
      sacrifice: {
        filter: { supertype: "legendary", typesAnyOf: ["artifact", "creature"] },
        text: "Sacrifice a legendary artifact or legendary creature",
      },
    }),
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: { kind: "amass", amount: 1, creatureType: "Orc" },
      resolve: null,
      text: AMASS_TEXT,
    },
    {
      // Each Army, once per player it deals combat damage to.
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { subtype: "Army" } },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: TEMPT_TEXT,
    },
    {
      // Even a temptation with no creature to choose (the ruling).
      trigger: { on: "ring-tempts", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw four cards?",
        effect: { kind: "discard-hand", who: "you" },
        then: { kind: "draw", amount: 4 },
      },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
