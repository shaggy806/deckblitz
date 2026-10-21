import { defineCard } from "../define.js";

// EDHREC rank 9066.

const ENTER_TEXT = "If Grunn was kicked, it enters with five +1/+1 counters on it.";
const ALONE_TEXT = "Whenever Grunn attacks alone, double its power and toughness until end of turn.";

export default defineCard({
  name: "Grunn, the Lonely King",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ape", "Warrior"],
  power: 5,
  toughness: 5,
  kicker: { cost: "{3}" },
  text: `Kicker {3} (You may pay an additional {3} as you cast this spell.)\n${ENTER_TEXT}\n${ALONE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 5, else: 0 } },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      // Doubling is "gets +X/+Y, where X and Y are its power and toughness"
      // as the effect begins (the ruling) — a negative power doubles down.
      trigger: { on: "attacks-alone", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source", doubling: true },
        toughness: { toughnessOf: "source", doubling: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
});
