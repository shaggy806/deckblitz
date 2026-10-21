import { defineCard } from "../define.js";

const COPY_TEXT =
  "When you cast this spell, copy it for each time you've cast your commander from the command zone this game. You may choose new targets for the copies.";
const SPELL_TEXT = "Copy target instant or sorcery spell. You may choose new targets for the copy.";

// Hatut Zeraze Strike Force's cast trigger with Thunderclap Drake's new
// targets: the count is read as the trigger resolves, and the copies aren't
// cast, so they don't copy themselves again (the rulings).
export default defineCard({
  name: "Fury Storm",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${COPY_TEXT}\n${SPELL_TEXT}`,
  targets: ["instant-or-sorcery-spell"],
  effect: { kind: "copy-spell", target: 0, newTargets: true },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, count: { commanderCasts: "you" } },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
