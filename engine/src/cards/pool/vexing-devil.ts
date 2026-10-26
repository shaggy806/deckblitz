import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, any opponent may have it deal 4 damage to them. If a player does, sacrifice this creature.";

export default defineCard({
  name: "Vexing Devil",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Each opponent is asked in turn (the 2018 ruling); each one who accepts
      // is dealt the 4 (their own choice, so "you" is them), and the Devil is
      // sacrificed if any did — a second sacrifice finds nothing.
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Have Vexing Devil deal 4 damage to you? (If you do, it's sacrificed.)",
        effect: { kind: "damage", amount: 4, who: "you" },
        ifDid: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
