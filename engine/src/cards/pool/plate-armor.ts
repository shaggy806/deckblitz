import { defineCard } from "../define.js";

const PUMP =
  "Equipped creature gets +3/+3 and has ward {1}. (Whenever equipped creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)";
const EQUIP =
  "Equip {3}. This ability costs {1} less to activate for each other Equipment you control. ({3}: Attach to target creature you control. Equip only as a sorcery.)";

export default defineCard({
  name: "Plate Armor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\n${EQUIP}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
          targets: [],
          effect: { kind: "ward", cost: { mana: "{1}" } },
          resolve: null,
          text: "Ward {1}",
        },
      ],
      text: PUMP,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      costReduction: { reduceGeneric: { countOf: { subtype: "Equipment", controlledBy: "you" }, excludeSelf: true } },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: EQUIP,
    },
  ],
});
