import { defineCard } from "../define.js";

// The tokens are made first, so the pump and haste reach them too (the
// ruling); creatures that arrive later in the turn get neither.
export default defineCard({
  name: "Heroic Reinforcements",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Create two 1/1 white Soldier creature tokens. Until end of turn, creatures you control get +1/+1 and gain haste. (They can attack and {T} this turn.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Soldier Token", count: 2 },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "haste",
        duration: "end-of-turn",
      },
    ],
  },
});
