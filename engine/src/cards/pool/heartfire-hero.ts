import { defineCard } from "../define.js";
import { valiant } from "../helpers.js";

// Rulings:
//   [2024-07-26] Use Heartfire Hero's power as it last existed on the battlefield to determine how
//     much damage it deals due to its last ability.
//   [2024-07-26] If a spell or ability you control has one or more of its targets changed to a
//     creature you control with a valiant ability, that ability will trigger if that creature hasn't
//     yet been the target of a spell or ability you control this turn.

const VALIANT_TEXT =
  "Valiant — Whenever this creature becomes the target of a spell or ability you control for the first time each turn, put a +1/+1 counter on it.";
const DIES_TEXT = "When this creature dies, it deals damage equal to its power to each opponent.";

export default defineCard({
  name: "Heartfire Hero",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mouse", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${VALIANT_TEXT}\n${DIES_TEXT}`,
  triggered: [
    valiant({ kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 }, VALIANT_TEXT),
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // Its power as it last existed on the battlefield (the ruling).
      effect: { kind: "damage", amount: { powerOf: "source" }, who: "each-opponent" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
