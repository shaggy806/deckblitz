import { defineCard } from "../define.js";

// "You may sacrifice a Forest. If you do, …" is an `each-player-may` of the
// controller alone, offered only with a Forest to sacrifice; "that creature"
// is the equipped creature that attacked (the trigger object).
const ATTACK_TEXT =
  "Whenever equipped creature attacks, you may sacrifice a Forest. If you do, that creature gains trample until end of turn.";

export default defineCard({
  name: "Spiked Ripsaw",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +3/+3.\n${ATTACK_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Equipped creature gets +3/+3." }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { subtype: "Forest" }, text: "Sacrifice a Forest" }],
        ifDid: { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
