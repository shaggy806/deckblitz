import { defineCard } from "../define.js";

const ENTER_TEXT = "Whenever a creature enters, destroy it.";
const END_TEXT = "{0}: Destroy this enchantment. You skip your next turn. Any player may activate this ability.";

/** Whoever activates the ability controls it (rule 602.2a), so "you skip
 * your next turn" is the activator's skip. */
export default defineCard({
  name: "Lethal Vapors",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: "source" },
          { kind: "skip-turn", who: "you" },
        ],
      },
      resolve: null,
      anyPlayer: true,
      text: END_TEXT,
    },
  ],
});
