import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghor-Clan Rampager",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nBloodrush — {R}{G}, Discard this card: Target attacking creature gets +4/+4 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{R}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Bloodrush — {R}{G}, Discard this card: Target attacking creature gets +4/+4 and gains trample until end of turn.",
      zone: "hand",
    },
  ],
});
