import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 11302. Something Worth Saving's milled pick, onto the battlefield.

const HIT_TEXT =
  "Whenever this Vehicle deals combat damage to a player, mill four cards. You may put a permanent card from among them onto the battlefield.";

export default defineCard({
  name: "Mole Module",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  keywords: ["menace"],
  text: `Menace\n${HIT_TEXT}\nCrew 2`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: {
              thisWay: "milled",
              typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
            },
          },
        ],
      },
      resolve: null,
      text: HIT_TEXT,
    },
  ],
});
