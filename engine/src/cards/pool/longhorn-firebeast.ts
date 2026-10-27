import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, any opponent may have it deal 5 damage to them. If a player does, sacrifice this creature.";

export default defineCard({
  name: "Longhorn Firebeast",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Ox", "Beast"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Vexing Devil's shape: each opponent is asked in turn, each who accepts
      // is dealt the 5, and the Firebeast is sacrificed if any did.
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Have Longhorn Firebeast deal 5 damage to you? (If you do, it's sacrificed.)",
        effect: { kind: "damage", amount: 5, who: "you" },
        ifDid: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
