import { defineCard } from "../define.js";

// EDHREC rank 20163. On a Vehicle it's a creature in addition to its other
// types (with its printed power and toughness), so it gets the bonus too;
// moved off a Vehicle in combat, the Vehicle stops being a creature and is
// removed from combat unless crewed (the ruling, rule 506.4).

const ANIMATE = "As long as enchanted permanent is a Vehicle, it's a creature in addition to its other types.";
const BONUS = "Enchanted creature gets +2/+2 and has flying.";

export default defineCard({
  name: "Aerial Modification",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or Vehicle\n${ANIMATE}\n${BONUS}`,
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Vehicle" } } },
      addTypes: ["creature"],
      text: ANIMATE,
    },
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: BONUS,
    },
  ],
});
