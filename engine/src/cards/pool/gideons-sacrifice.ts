import { defineCard } from "../define.js";

// EDHREC rank 5220.
//
// The permanent is chosen, not targeted, as it resolves; with none to choose
// nothing happens (the ruling). Then a redirection for the turn (rule
// 614.9): damage to you or a permanent you control is dealt to it instead,
// by the same source and still combat damage where it was (the ruling), and
// none while it isn't on the battlefield or isn't a creature or planeswalker
// (the ruling). With two of them, the affected player orders them (rule
// 616.1), so the damage goes to one of the chosen permanents, all of it.

const TEXT =
  "Choose a creature or planeswalker you control. All damage that would be dealt this turn to you and permanents you control is dealt to the chosen permanent instead (if it's still on the battlefield).";

export default defineCard({
  name: "Gideon's Sacrifice",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-permanents",
    filter: { typesAnyOf: ["creature", "planeswalker"], controlledBy: "you" },
    min: 1,
    upTo: 1,
    prompt: "Choose a creature or planeswalker you control: damage to you and your permanents this turn is dealt to it instead",
    then: {
      kind: "damage-rule",
      to: { players: "you", permanents: { controlledBy: "you" } },
      redirectTo: 0,
    },
  },
});
