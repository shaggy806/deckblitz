import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 26272. Leeching Bite's shape at +4/+0 and -4/-0.

export default defineCard({
  name: "Schismotivate",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Target creature gets +4/+0 until end of turn. Another target creature gets -4/-0 until end of turn.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 4, toughness: 0, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: -4, toughness: 0, duration: "end-of-turn" },
    ],
  },
});
