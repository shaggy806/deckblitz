import { defineCard } from "../define.js";

// EDHREC rank 27862. Modern Horizons 2.
//
// The last ability can be activated while it's already tapped or
// indestructible (its ruling).
const HELLBENT_TEXT = "Hellbent — This creature has lifelink as long as you have no cards in hand.";
const SHIELD_TEXT = "{B}, Discard a card: This creature gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Necromancer's Familiar",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Spirit"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${HELLBENT_TEXT}\n${SHIELD_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: SHIELD_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      grantKeywords: ["lifelink"],
      text: HELLBENT_TEXT,
    },
  ],
});
