import { defineCard } from "../define.js";

const PLUS =
  "If another source you control would deal noncombat damage to a permanent or player, it deals that much damage plus 1 to that permanent or player instead.";
const CAST = "Whenever you cast an instant or sorcery spell, Tor Wauki deals 2 damage to any target.";

export default defineCard({
  name: "Tor Wauki the Younger",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 3,
  toughness: 3,
  keywords: ["reach", "lifelink"],
  text: `Reach, lifelink\n${PLUS}\n${CAST}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", instead: { modify: { plus: 1 } }, fromOther: true, combat: false, source: { controlledBy: "you" } },
      text: PLUS,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: CAST,
    },
  ],
});
