import { defineCard } from "../define.js";

// Sacrificed to pay for its second ability, the Wall is gone
// before the ability resolves: "target creature it's blocking" is then read
// off its last-known information (rules 608.2b, 608.2h) — the attacker it was
// blocking as it left, still a blocked creature (509.1h).
const MANA_TEXT = "Sacrifice this creature: Add {R}{R}.";
const DAMAGE_TEXT = "{R}, Sacrifice this creature: It deals 2 damage to target creature it's blocking.";

export default defineCard({
  name: "Tinder Wall",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Wall"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${MANA_TEXT}\n${DAMAGE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 2 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocked-by" } } }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
