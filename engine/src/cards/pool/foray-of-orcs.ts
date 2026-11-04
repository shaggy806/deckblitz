import { defineCard } from "../define.js";

// The Lord of the Rings: Tales of Middle-earth.
//
// Rulings:
//   You don't choose a target for Foray of Orcs at the time you cast it. Rather, a second "reflexive"
//     ability triggers when you amass Orcs this way. You choose a target for that ability as it goes
//     on the stack. Each player may respond to this triggered ability as normal.
//
// `about: "amassed"`: the Army is the reflexive ability's trigger object, its power read as the
// ability resolves, as it last existed if it has gone (rule 608.2h).

const TEXT =
  "Amass Orcs 2. When you do, Foray of Orcs deals X damage to target creature an opponent controls, where X is the amassed Army's power. (To amass Orcs 2, put two +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)";

export default defineCard({
  name: "Foray of Orcs",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "amass", amount: 2, creatureType: "Orc" },
      {
        kind: "reflexive-trigger",
        about: "amassed",
        targets: ["creature-an-opponent-controls"],
        effect: { kind: "damage", amount: { powerOf: "trigger-object" }, target: 0 },
        text: "When you do, Foray of Orcs deals X damage to target creature an opponent controls, where X is the amassed Army's power.",
      },
    ],
  },
});
