import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature blocks a black or red creature, the blocking creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Righteous Indignation",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      // Once per blocker of each black or red attacker; the blocker is the
      // trigger object.
      trigger: {
        on: "blocked-by",
        who: "any",
        filter: { type: "creature", anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
        blocker: { type: "creature" },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
