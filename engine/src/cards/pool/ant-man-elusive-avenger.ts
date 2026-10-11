import { defineCard } from "../define.js";

// EDHREC rank 12597.
//
// Skulk's rule without the keyword: the powers are compared as blockers are
// declared (Champion of Lambholt's `{ powerOf: "source" }`, read off Ant-Man
// then).

const EVADE_TEXT = "Ant-Man can't be blocked by creatures with greater power.";
const TREASURE_TEXT = "Whenever Ant-Man deals combat damage to a player, create that many Treasure tokens.";

export default defineCard({
  name: "Ant-Man, Elusive Avenger",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Hero"],
  power: 1,
  toughness: 2,
  text: `${EVADE_TEXT}\n${TREASURE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
      text: EVADE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: { triggerValue: true } },
      resolve: null,
      text: TREASURE_TEXT,
    },
  ],
});
