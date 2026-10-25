import { defineCard } from "../define.js";

const HEXPROOF_TEXT = "Dragonlord Ojutai has hexproof as long as it's untapped.";
const DAMAGE_TEXT =
  "Whenever Dragonlord Ojutai deals combat damage to a player, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Dragonlord Ojutai",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${HEXPROOF_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
