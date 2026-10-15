import { defineCard } from "../define.js";

// EDHREC rank 23715. The token is made first, so "creatures you control" as
// the pump applies includes it.
export default defineCard({
  name: "Hire a Crew",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Create a 2/1 black Villain creature token with menace, then creatures you control get +1/+0 until end of turn. (A creature with menace can't be blocked except by two or more creatures.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Villain Token", count: 1 },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
    ],
  },
});
