import { defineCard } from "../define.js";

export default defineCard({
  name: "Wrecking Ogre",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["double-strike"],
  text: "Double strike\nBloodrush — {3}{R}{R}, Discard this card: Target attacking creature gets +3/+3 and gains double strike until end of turn.",
  activated: [
    {
      cost: { mana: "{3}{R}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "double-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Bloodrush — {3}{R}{R}, Discard this card: Target attacking creature gets +3/+3 and gains double strike until end of turn.",
      zone: "hand",
    },
  ],
});
