import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Rulings: the attach trigger fires for any Shaman creature, whoever controls
// it — you may attach the Staff to an opponent's creature this way, and keep
// controlling the Staff. The granted abilities belong to the equipped
// creature (Viridian Longbow's shape): it deals the damage, and it untaps.

const PING = "{2}, {T}: This creature deals 1 damage to any target.";
const UNTAP = "Whenever a creature dies, untap this creature.";
const GRANT_TEXT = `Equipped creature has "${PING}" and "${UNTAP}"`;
const ATTACH_TEXT = "Whenever a Shaman creature enters, you may attach this Equipment to it.";

export default defineCard({
  name: "Thornbite Staff",
  manaCost: "{2}",
  colors: [],
  types: ["kindred", "artifact"],
  subtypes: ["Shaman", "Equipment"],
  text: `${GRANT_TEXT}\n${ATTACH_TEXT}\nEquip {4}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: PING,
        },
      ],
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "any", filter: { type: "creature" } },
          targets: [],
          effect: { kind: "untap", target: "source" },
          resolve: null,
          text: UNTAP,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", subtype: "Shaman" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Thornbite Staff to that Shaman?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
