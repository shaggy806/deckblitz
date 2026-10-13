import { defineCard } from "../define.js";

// EDHREC rank 3286.
//
// Whether you're the monarch is read as it resolves. The token copies the
// target's copiable values (what it copies, if it's a copy) and enters, so
// its "enters" abilities work. Becoming a copy, the Court enters nothing
// (rule 707.4), keeps this ability — a copiable exception (rule 707.9a), so a
// copy of the Court has it too — and the copy lasts until another overwrites
// it (rule 611.2a). Copying a token doesn't make it one; copying an Aura it
// isn't attached to puts it into the graveyard (rule 704.5m).
const MONARCH_TEXT = "When this enchantment enters, you become the monarch.";
const COPY_TEXT =
  "At the beginning of your upkeep, choose up to one other target enchantment or artifact. If you're the monarch, you may create a token that's a copy of it. If you're not the monarch, you may have this enchantment become a copy of it, except it has this ability.";

export default defineCard({
  name: "Court of Vantress",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${MONARCH_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "optional", of: { kind: "other", of: "artifact-or-enchantment" } }],
      effect: {
        kind: "conditional",
        condition: { kind: "monarch", who: "you" },
        then: {
          kind: "may",
          prompt: "Create a token that's a copy of it?",
          effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
        },
        else: {
          kind: "may",
          prompt: "Have Court of Vantress become a copy of it?",
          effect: {
            kind: "become-copy",
            target: "source",
            of: 0,
            exceptions: { thisAbility: { card: "Court of Vantress", triggered: 1 } },
          },
        },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
