import { defineCard } from "../define.js";

const ATTACH = "Whenever an Artificer you control enters, you may attach this Equipment to it.";

// Hero's Blade's shape: an Artificer gone before the trigger resolves leaves
// the Goggles where they were (the ruling — the attach finds nothing).
export default defineCard({
  name: "Inventor's Goggles",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+2.\n${ATTACH}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
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
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Artificer" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Inventor's Goggles to it?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: ATTACH,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Equipped creature gets +1/+2." }],
});
