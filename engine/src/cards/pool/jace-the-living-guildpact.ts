import { defineCard } from "../define.js";

// The card not put into the graveyard stays on top (the ruling).
const LOOK_TEXT = "+1: Look at the top two cards of your library. Put one of them into your graveyard.";
const BOUNCE_TEXT = "−3: Return another target nonland permanent to its owner's hand.";
const ULTIMATE_TEXT = "−8: Each player shuffles their hand and graveyard into their library. You draw seven cards.";

export default defineCard({
  name: "Jace, the Living Guildpact",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 5,
  text: `${LOOK_TEXT}\n${BOUNCE_TEXT}\n${ULTIMATE_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "graveyard",
        leftover: "stay",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "other", of: "nonland-permanent" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
          { kind: "draw", amount: 7 },
        ],
      },
      resolve: null,
      text: ULTIMATE_TEXT,
    },
  ],
});
