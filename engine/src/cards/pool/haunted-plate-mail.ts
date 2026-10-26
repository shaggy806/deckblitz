import { defineCard } from "../define.js";

const ANIMATE_TEXT =
  "{0}: Until end of turn, this permanent becomes a 4/4 Spirit artifact creature that's no longer an Equipment. Activate only if you control no creatures.";

export default defineCard({
  name: "Haunted Plate Mail",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +4/+4.\n${ANIMATE_TEXT}\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
      targets: [],
      // "No longer an Equipment": its types are set to creature (rule 205.1a
      // drops Equipment, an artifact subtype, with the artifact type), then
      // artifact is added back in the same layer-4 modifier, and Spirit.
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        setTypes: ["creature"],
        addTypes: ["artifact"],
        addSubtypes: ["Spirit"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [4, 4], text: "Equipped creature gets +4/+4." }],
});
