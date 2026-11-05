import { defineCard } from "../define.js";

const TEXT =
  "Whenever Niv-Mizzet deals combat damage to a player, it deals X damage to any target, target player draws X cards, and you gain X life, where X is the number of different color pairs among permanents you control that are exactly two colors.";
const X = { aggregate: "distinct", of: "color-pair", filter: { controlledBy: "you" } } as const;

export default defineCard({
  name: "Niv-Mizzet, Guildpact",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying, hexproof from multicolored\n${TEXT}`,
  static: [{ affects: { scope: "self" }, hexproofFrom: { filter: { multicolored: true } }, text: "Hexproof from multicolored" }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: ["any-target", "player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: X, target: 0 },
          { kind: "draw", amount: X, target: 1 },
          { kind: "gain-life", amount: X },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
