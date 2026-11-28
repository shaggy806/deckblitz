import { CHOSEN_COLOR } from "../../effects.js";
import { defineCard } from "../define.js";

// The colour is chosen as the ability resolves (`choose-value`) and set into
// the delayed ability it makes (rule 603.7c, "whenever … this turn"), so each
// activation's colour is its own: two activations naming two colours watch for
// both. The delayed ability is no ability of the Boa's ("self" is the Boa as it
// was then), and "that creature" is the blocker.

const TEXT =
  "{1}{B}: Choose a color. Whenever this creature becomes blocked by a creature of that color this turn, destroy that creature. Activate only as a sorcery.";

export default defineCard({
  name: "Zombie Boa",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Snake"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "choose-value",
        value: "color",
        then: {
          kind: "delayed-trigger",
          at: { whenever: { on: "blocked-by", who: "self", blocker: { type: "creature", colors: [CHOSEN_COLOR] } } },
          effect: { kind: "destroy", target: "trigger-object" },
          text: "Destroy that creature.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
