import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] The enchanted creature gains the artifact type in addition to any other card
//     types it may already have.
//   [2013-04-15] Paying the cost to end the effect is a special action and can't be responded to.
//   [2013-09-20] When the activated ability resolves, Transmogrifying Licid becomes an Aura
//     enchantment and ceases to be either a creature or an artifact.

const LICID_TEXT =
  "{1}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {1} to end this effect.";
const STATIC_TEXT = "Enchanted creature gets +1/+1 and is an artifact in addition to its other types.";

export default defineCard({
  name: "Transmogrifying Licid",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Licid"],
  power: 2,
  toughness: 2,
  text: `${LICID_TEXT}\n${STATIC_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{1}" },
      resolve: null,
      text: LICID_TEXT,
      licid: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      addTypes: ["artifact"],
      text: STATIC_TEXT,
    },
  ],
});
