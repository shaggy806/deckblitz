import { defineCard } from "../define.js";

// Rulings:
//   [2020-09-25] If there's no equipped creature as Skyclave Pick-Axe's landfall ability resolves,
//     no creature gets +2/+2.
//   [2020-09-25] The bonus applies to the creature it's attached to at the time the ability
//     resolves.
//   [2020-09-25] If the target creature becomes an illegal target, the Equipment remains on the
//     battlefield unattached.

const ATTACH_TEXT = "When this Equipment enters, attach it to target creature you control.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, equipped creature gets +2/+2 until end of turn.";
const EQUIP_TEXT = "Equip {2}{G} ({2}{G}: Attach to target creature you control. Equip only as a sorcery.)";

export default defineCard({
  name: "Skyclave Pick-Axe",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACH_TEXT}\n${LANDFALL_TEXT}\n${EQUIP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: EQUIP_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ATTACH_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "modify-pt", target: "attached", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
