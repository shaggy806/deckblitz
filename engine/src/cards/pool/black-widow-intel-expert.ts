import { defineCard } from "../define.js";

// EDHREC rank 17131.

const DRAW_TEXT =
  "Whenever Black Widow deals combat damage to an opponent, you and that player each draw two cards.";

// Combat damage to a player is always to an opponent: nobody attacks
// themselves, and a creature whose control changes leaves combat (rule
// 506.4). Xyris, the Writhing Storm's two draws.
export default defineCard({
  name: "Black Widow, Intel Expert",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "draw", amount: 2, who: "trigger-player" },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
