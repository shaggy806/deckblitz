import { defineCard } from "../define.js";

// EDHREC rank 17077.
//
// Rulings:
//   [2017-02-09] If Siege Modification becomes unattached from a Vehicle that's attacking or
//     blocking, that Vehicle will be removed from combat unless another effect (such as its crew
//     ability) is also making it a creature.

const VEHICLE = "As long as enchanted permanent is a Vehicle, it's a creature in addition to its other types.";
const PUMP = "Enchanted creature gets +3/+0 and has first strike.";

export default defineCard({
  name: "Siege Modification",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature or Vehicle\n${VEHICLE}\n${PUMP}`,
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Vehicle" } } },
      addTypes: ["creature"],
      text: VEHICLE,
    },
    {
      affects: { scope: "attached" },
      grantPt: [3, 0],
      grantKeywords: ["first-strike"],
      text: PUMP,
    },
  ],
});
