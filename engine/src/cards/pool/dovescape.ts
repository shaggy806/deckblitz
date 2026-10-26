import { defineCard } from "../define.js";

// Dissension. The Birds come whether or not the counter works (the ruling: a
// spell that can't be countered, or one already gone) — the sequence goes on
// either way, and the mana value is the spell's as it last was on the stack
// (608.2h; a split card's cast half, its {X} included).
const TEXT =
  "Whenever a player casts a noncreature spell, counter that spell. That player creates X 1/1 white and blue Bird creature tokens with flying, where X is the spell's mana value.";

export default defineCard({
  name: "Dovescape",
  manaCost: "{3}{W/U}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: `({W/U} can be paid with either {W} or {U}.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counter", target: "trigger-object" },
          {
            kind: "create-token",
            token: "Bird Token (White-Blue)",
            count: { manaValueOf: "trigger-object" },
            who: "trigger-controller",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
