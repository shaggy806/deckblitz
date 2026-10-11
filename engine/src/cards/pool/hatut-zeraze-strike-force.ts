import { defineCard } from "../define.js";

// EDHREC rank 17480.

const COPY_TEXT =
  "When you cast this spell, copy it for each time you've cast your commander from the command zone this game.";
const DESTROY_TEXT = "When this creature enters, destroy up to one target artifact or enchantment.";

// The count is read as the cast trigger resolves (Thunderclap Drake's): every
// cast of each of your commanders from the command zone. A copy of a creature
// spell becomes a token as it resolves, and isn't cast, so it doesn't copy
// itself again (rule 707.10).
export default defineCard({
  name: "Hatut Zeraze Strike Force",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${COPY_TEXT}\n${DESTROY_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", count: { commanderCasts: "you" } },
      resolve: null,
      text: COPY_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "artifact-or-enchantment" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
