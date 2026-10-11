import { defineCard } from "../define.js";

// EDHREC rank 15534.

const DRAW_TEXT =
  "Whenever a creature you control with deathtouch deals combat damage to a player, you draw a card and lose 1 life.";

// Fynn, the Fangbearer's trigger, with Barbed Servitor's draw-and-lose.
export default defineCard({
  name: "Black Widow, Deadly Hunter",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature", keyword: "deathtouch" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
