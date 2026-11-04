import { defineCard } from "../define.js";

// The trigger is the equipped creature's own, so hexproof and it come and go
// with the Equipment. Deathtouch is read as the block is declared (rule 509.3f).
const GRANTED = "Whenever a creature with deathtouch blocks or becomes blocked by this creature, destroy that creature.";
const TEXT = `Equipped creature gets +0/+2 and has hexproof and "${GRANTED}"`;
const DESTROY = { kind: "destroy", target: "trigger-object" } as const;

export default defineCard({
  name: "Mirror Shield",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      grantKeywords: ["hexproof"],
      grantsTriggered: [
        {
          trigger: { on: "blocked-by", who: "self", blocker: { keyword: "deathtouch" } },
          targets: [],
          effect: DESTROY,
          resolve: null,
          text: GRANTED,
        },
        {
          trigger: { on: "blocks", who: "self", object: "blocked" },
          whileCondition: { kind: "trigger-object", filter: { keyword: "deathtouch" } },
          targets: [],
          effect: DESTROY,
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
