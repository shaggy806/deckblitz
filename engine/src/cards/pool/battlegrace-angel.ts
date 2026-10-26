import { defineCard } from "../define.js";

// Shards of Alara (ALA).
//
// Exalted is the attacks-alone trigger (Duskmantle Prowler); the lifelink
// grant is a second, separate one (Peggy Carter's shape).

const LIFELINK = "Whenever a creature you control attacks alone, it gains lifelink until end of turn.";

export default defineCard({
  name: "Battlegrace Angel",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\nExalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n${LIFELINK}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Exalted",
    },
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: LIFELINK,
    },
  ],
});
