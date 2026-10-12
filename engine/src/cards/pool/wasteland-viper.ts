import { defineCard } from "../define.js";

export default defineCard({
  name: "Wasteland Viper",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 2,
  keywords: ["deathtouch"],
  text: "Deathtouch\nBloodrush — {G}, Discard this card: Target attacking creature gets +1/+2 and gains deathtouch until end of turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Bloodrush — {G}, Discard this card: Target attacking creature gets +1/+2 and gains deathtouch until end of turn.",
      zone: "hand",
    },
  ],
});
