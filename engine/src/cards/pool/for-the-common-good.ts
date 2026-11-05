import { defineCard } from "../define.js";

export default defineCard({
  name: "For the Common Good",
  manaCost: "{X}{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create X tokens that are copies of target token you control. Then tokens you control gain indestructible until your next turn. You gain 1 life for each token you control.",
  targets: [{ kind: "permanent", whose: "you", filter: { token: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token-copy", of: 0, count: "x", who: "you" },
      {
        kind: "grant-keyword-all",
        filter: { token: true, controlledBy: "you" },
        keyword: "indestructible",
        duration: "until-your-next-turn",
      },
      { kind: "gain-life", amount: { countOf: { token: true, controlledBy: "you" } } },
    ],
  },
});
