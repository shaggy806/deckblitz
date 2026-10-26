import { defineCard } from "../define.js";

// EDHREC rank 24344.

export default defineCard({
  name: "Nature's Cloak",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Green creatures you control gain forestwalk until end of turn. (They can't be blocked as long as defending player controls a Forest.)",
  effect: {
    kind: "grant-keyword-all",
    filter: { type: "creature", controlledBy: "you", colors: ["G"] },
    keyword: "forestwalk",
    duration: "end-of-turn",
  },
});
