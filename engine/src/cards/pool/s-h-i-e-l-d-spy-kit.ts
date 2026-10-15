import { defineCard } from "../define.js";

// EDHREC rank 18113.
//
// The lone attacker is the trigger object (Bilbo's Ring's "attacks alone"):
// "untap it" untaps that creature, not the Equipment.
const ATTACK_TEXT = "Whenever equipped creature attacks alone, untap it and scry 1.";

export default defineCard({
  name: "S.H.I.E.L.D. Spy Kit",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    `Equipped creature gets +1/+1.\n${ATTACK_TEXT} (Look at the top card of your library. You may put that card on the bottom.)\n` +
    "Equip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "trigger-object" },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
});
