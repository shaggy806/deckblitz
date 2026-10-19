import { defineCard } from "../define.js";

const TEXT =
  "Domain — Whenever Radha becomes tapped, another target creature you control gets +X/+X until end of turn, where X is the number of basic land types among lands you control.";

export default defineCard({
  name: "Radha, Coalition Warlord",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { basicLandTypes: "you" },
        toughness: { basicLandTypes: "you" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
