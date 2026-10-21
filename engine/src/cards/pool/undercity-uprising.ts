import { defineCard } from "../define.js";

// EDHREC rank 19387. Guilds of Ravnica. Deathtouch goes to the creatures you
// control as it resolves, even when one fight target has gone illegal and no
// fight happens (the rulings).

export default defineCard({
  name: "Undercity Uprising",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Creatures you control gain deathtouch until end of turn. Then target creature you control fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "deathtouch",
        duration: "end-of-turn",
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
