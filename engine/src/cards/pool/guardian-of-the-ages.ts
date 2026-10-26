import { defineCard } from "../define.js";

const TEXT =
  "When a creature attacks you or a planeswalker you control, if this creature has defender, it loses defender and gains trample.";

export default defineCard({
  name: "Guardian of the Ages",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 7,
  toughness: 7,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true },
      // Intervening if (rule 603.4): checked as it triggers and resolves.
      condition: { kind: "source", filter: { keyword: "defender" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "permanent" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "permanent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
