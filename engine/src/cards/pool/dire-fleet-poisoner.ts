import { defineCard } from "../define.js";

// EDHREC rank 14038.

export default defineCard({
  name: "Dire Fleet Poisoner",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "deathtouch"],
  text: "Flash\nDeathtouch\nWhen this creature enters, target attacking Pirate you control gets +1/+1 and gains deathtouch until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Pirate", controlledBy: "you", attacking: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature enters, target attacking Pirate you control gets +1/+1 and gains deathtouch until end of turn.",
    },
  ],
});
