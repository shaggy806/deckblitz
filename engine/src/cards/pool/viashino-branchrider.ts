import { defineCard } from "../define.js";

// EDHREC rank 24605.
//
// "If this creature was kicked, it enters with two +1/+1 counters on it" is
// its own enters replacement (rule 614.1c) whose amount asks `self-kicked`:
// the kicked bit is carried onto the permanent before its replacements apply.

const ENTER_TEXT = "If this creature was kicked, it enters with two +1/+1 counters on it.";

export default defineCard({
  name: "Viashino Branchrider",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Kicker {2}{G} (You may pay an additional {2}{G} as you cast this spell.)\nHaste\n${ENTER_TEXT}\n{2}{R}: This creature gets +2/+0 until end of turn.`,
  kicker: { cost: "{2}{G}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{R}: This creature gets +2/+0 until end of turn.",
    },
  ],
});
