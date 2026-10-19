import { defineCard } from "../define.js";

// EDHREC rank 7238.

export default defineCard({
  name: "Rilsa Rael, Kingpin",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 5,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhen Rilsa Rael enters, you take the initiative.\nWhenever you attack, target attacking creature gains deathtouch until end of turn. If you've completed a dungeon, that creature also gets +5/+0 and gains first strike and menace until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When Rilsa Rael enters, you take the initiative.",
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "completed-dungeon" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: 0, power: 5, toughness: 0, duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "Whenever you attack, target attacking creature gains deathtouch until end of turn. If you've completed a dungeon, that creature also gets +5/+0 and gains first strike and menace until end of turn.",
    },
  ],
});
