import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";
import type { CardFilter } from "../../filter.js";

// Anyone's Mounts and Vehicles, two different ones (rule 115.3), Lagorin
// itself among them.
const ATTACK_TEXT =
  "Whenever Lagorin attacks while saddled, put a +1/+1 counter on each of up to two target Mounts and/or Vehicles.";
const MOUNT_OR_VEHICLE: CardFilter = { subtypes: ["Mount", "Vehicle"] };

export default defineCard({
  name: "Lagorin, Soul of Alacria",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Beast", "Mount"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${saddleText(1)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [
        { kind: "optional", of: { kind: "permanent", filter: MOUNT_OR_VEHICLE } },
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", filter: MOUNT_OR_VEHICLE }, than: { slots: [0] } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(1, saddleText(1))],
});
