import { defineCard } from "../define.js";

// EDHREC rank 11561.
//
// A conditional grant of the triggered ability (layer 6, Fire Nation Cadets'
// shape): the enchantment has it only while threshold holds, so it triggers
// only if there are seven or more cards in your graveyard as the opponent
// casts the spell. Putting the creature onto the battlefield isn't casting it.

const GRANTED_TEXT = "Whenever an opponent casts a spell, you may put a creature card from your hand onto the battlefield.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this enchantment has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Hunting Grounds",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["enchantment"],
  text: THRESHOLD_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "cast-spell", who: "opponent" },
          targets: [],
          effect: {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "creature" },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
