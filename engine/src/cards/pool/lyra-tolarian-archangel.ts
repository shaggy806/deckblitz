import { defineCard } from "../define.js";

// EDHREC rank 18985. Reality Fracture.
//
// The end-step trigger is an intervening-if (rule 603.4), checked as each end
// step begins and again as it resolves — on any player's turn, counting the
// cards *you* drew this turn. The activated ability sets up Captain Howler's
// delayed trigger on Lyra herself: it fires each time she deals combat
// damage to a player this turn (double strike twice), in this stint on the
// battlefield only (rule 400.7), and each activation adds another.

const END_TEXT =
  "At the beginning of each end step, if you've drawn three or more cards this turn, create a 3/3 blue Angel creature token with flying.";
const DRAW_TEXT = "{3}{U}{U}: Until end of turn, whenever Lyra deals combat damage to a player, draw two cards.";

export default defineCard({
  name: "Lyra, Tolarian Archangel",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${END_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 3 },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Angel Token", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { dealsCombatDamage: "source" },
        effect: { kind: "draw", amount: 2 },
        text: "Whenever Lyra deals combat damage to a player this turn, draw two cards.",
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
