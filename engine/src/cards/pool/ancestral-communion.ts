import { defineCard } from "../define.js";

// EDHREC rank 15287.
//
// "When you cast this spell while you control your commander" is a cast
// trigger of the spell itself whose "while" is part of the trigger event
// (`whileCondition`, rule 603.1) — asked as it's cast, not again as the
// trigger resolves. "Your commander" is one you own (rule 903.3). The copy
// is of the spell as it last was on the stack, so it's made even if the
// original was countered in response.

const COPY_TEXT =
  "When you cast this spell while you control your commander, copy this spell. You may choose a new target for the copy.";
const RETURN_TEXT = "Return target permanent card from your graveyard to your hand.";

export default defineCard({
  name: "Ancestral Communion",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${COPY_TEXT}\n${RETURN_TEXT}`,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  triggered: [
    {
      trigger: { on: "this-cast" },
      whileCondition: { kind: "controls", filter: { isCommander: true, ownedBy: "you" }, atLeast: 1 },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
