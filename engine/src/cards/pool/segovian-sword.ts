import { defineCard } from "../define.js";

// Playtest card. "For Segovia!" is For Mirrodin! with a -1/-1 blue Squid: the Squid is attached to
// before state-based actions look at it, so it lives as a 1/1 while the Sword stays on it.

const SEGOVIA =
  "For Segovia! (When this Equipment enters the battlefield, create a -1/-1 blue Squid creature token, then attach this to it. Yes, it's a -1/-1 creature.)";
const GRANT = "Equipped creature gets +2/+2 and has skulk (It can't be blocked by creatures with greater power.)";

export default defineCard({
  name: "Segovian Sword",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${SEGOVIA}\n${GRANT}\nEquip {3}`,
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
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Squid Token (-1/-1)", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: "For Segovia!",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], grantKeywords: ["skulk"], text: GRANT }],
});
