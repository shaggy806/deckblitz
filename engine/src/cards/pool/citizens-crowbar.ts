import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ENTERS_TEXT =
  "When this Equipment enters, create a 1/1 green and white Citizen creature token, then attach this Equipment to it.";
const GRANTED = "{W}, {T}, Sacrifice Citizen's Crowbar: Destroy target artifact or enchantment.";
const TEXT = `Equipped creature gets +1/+1 and has "${GRANTED}"`;

export default defineCard({
  name: "Citizen's Crowbar",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Citizen Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsActivated: [
        {
          cost: { mana: "{W}", tap: true, sacrifice: "granter" },
          targets: ["artifact-or-enchantment"],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{2}")],
});
