import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice The Great Juggernaut unless you discard a card.";
const ATTACK_TEXT =
  "Whenever The Great Juggernaut attacks, shuffle your library then exile the top card of your library. You may play that card without paying its mana cost this turn.";

export default defineCard({
  name: "The Great Juggernaut",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 5,
  toughness: 3,
  text: `${UPKEEP_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ discard: 1, text: "Discard a card" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-library" },
          { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true, free: true },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
