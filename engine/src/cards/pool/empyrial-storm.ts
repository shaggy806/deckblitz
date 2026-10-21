import { defineCard } from "../define.js";

const COPY_TEXT =
  "When you cast this spell, copy it for each time you've cast your commander from the command zone this game.";

export default defineCard({
  name: "Empyrial Storm",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `${COPY_TEXT}\nCreate a 4/4 white Angel creature token with flying.`,
  effect: { kind: "create-token", token: "4/4 Angel Token", count: 1 },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", count: { commanderCasts: "you" } },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
