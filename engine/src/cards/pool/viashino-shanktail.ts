import { defineCard } from "../define.js";

export default defineCard({
  name: "Viashino Shanktail",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 3,
  toughness: 1,
  keywords: ["first-strike"],
  text: "First strike\nBloodrush — {2}{R}, Discard this card: Target attacking creature gets +3/+1 and gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Bloodrush — {2}{R}, Discard this card: Target attacking creature gets +3/+1 and gains first strike until end of turn.",
      zone: "hand",
    },
  ],
});
