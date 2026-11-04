import { defineCard } from "../define.js";

// EDHREC rank 904.
//
// An intervening if (rule 603.4): the live greatest mana value among every
// artifact on the battlefield is read as the upkeep begins and again as the
// ability resolves (the rulings). Only artifacts count, and an {X} is 0 there
// (rule 107.3b, the rulings) — `controls-greatest` reads `mana-value`.

const HEXPROOF = "Artifacts you control have hexproof. (They can't be the targets of spells or abilities your opponents control.)";
const DRAW =
  "At the beginning of your upkeep, if you control the artifact with the greatest mana value or tied for the greatest mana value, draw a card.";

export default defineCard({
  name: "Padeem, Consul of Innovation",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Vedalken", "Artificer"],
  power: 1,
  toughness: 4,
  text: `${HEXPROOF}\n${DRAW}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", controlledBy: "you" } },
      grantKeywords: ["hexproof"],
      text: HEXPROOF,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls-greatest", of: "mana-value", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
});
