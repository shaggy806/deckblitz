import { defineCard } from "../define.js";

export default defineCard({
  name: "Arlinn Kord",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Arlinn"],
  loyalty: 3,
  text: "+1: Until end of turn, up to one target creature gets +2/+2 and gains vigilance and haste.\n0: Create a 2/2 green Wolf creature token. Transform Arlinn Kord.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "+1: Until end of turn, up to one target creature gets +2/+2 and gains vigilance and haste.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Wolf Token", count: 1 },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: "0: Create a 2/2 green Wolf creature token. Transform Arlinn Kord.",
    },
  ],
  faces: ["Arlinn Kord", "Arlinn, Embraced by the Moon"],
  transform: true,
});
