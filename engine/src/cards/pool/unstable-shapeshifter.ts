import { defineCard } from "../define.js";

// EDHREC rank 25833. Not targeted, and not optional: it becomes a copy of the entering
// creature (as it last existed, if it's gone), keeping this triggered ability as a copiable
// exception (rule 707.9a — Thespian's Stage's `thisAbility`), so a copy of it copies on
// too. Becoming a copy isn't entering: no enters triggers and no as-enters choices (the
// rulings).

const TEXT =
  "Whenever another creature enters, this creature becomes a copy of that creature, except it has this ability.";

export default defineCard({
  name: "Unstable Shapeshifter",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "become-copy",
        target: "source",
        of: "trigger-object",
        exceptions: { thisAbility: { card: "Unstable Shapeshifter", triggered: 0 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
