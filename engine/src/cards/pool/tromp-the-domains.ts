import { defineCard } from "../define.js";

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Tromp the Domains",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Domain — Until end of turn, creatures you control gain trample and get +1/+1 for each basic land type among lands you control.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: YOURS, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "modify-pt-all",
        filter: YOURS,
        power: { basicLandTypes: "you" },
        toughness: { basicLandTypes: "you" },
        duration: "end-of-turn",
      },
    ],
  },
});
