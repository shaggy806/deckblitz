import { defineCard } from "../define.js";

// The granted "whenever this creature deals combat damage" names no
// recipient, so it fires once per combat damage step for the total (rule
// 603.2c).
const GRANTED_TEXT = "Whenever this creature deals combat damage, untap it and you gain 2 life.";
const STATIC_TEXT = `Equipped creature gets +1/+1 and has "${GRANTED_TEXT}"`;
const NINJA_TEXT = "Whenever a Ninja you control enters, you may attach this Equipment to it.";

export default defineCard({
  name: "Quintessential Katana",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${NINJA_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "self", combat: true },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "untap", target: "source" },
              { kind: "gain-life", amount: 2 },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
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
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ninja" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Quintessential Katana to it?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: NINJA_TEXT,
    },
  ],
});
