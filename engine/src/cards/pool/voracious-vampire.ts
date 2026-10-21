import { defineCard } from "../define.js";

// EDHREC rank 26241.

export default defineCard({
  name: "Voracious Vampire",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: "Menace\nWhen this creature enters, target Vampire you control gets +1/+1 and gains menace until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Vampire", controlledBy: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature enters, target Vampire you control gets +1/+1 and gains menace until end of turn.",
    },
  ],
});
