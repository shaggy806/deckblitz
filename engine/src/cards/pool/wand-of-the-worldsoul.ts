import { defineCard } from "../define.js";
import { entersTappedStatic, manaTapAbility } from "../helpers.js";

// "The next spell you cast this turn has convoke" (rule 702.51): a `next`
// `grant-spells-this-turn`, offered as the spell that would use it up is
// cast (its costs are paid before it becomes cast, 601.2h–i). Not a mana
// ability: it makes no mana (rule 605.1a), so it uses the stack.

const TEXT = "{T}: The next spell you cast this turn has convoke.";

export default defineCard({
  name: "Wand of the Worldsoul",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `This artifact enters tapped.\n{T}: Add {W}.\n${TEXT}`,
  static: [entersTappedStatic("Wand of the Worldsoul")],
  activated: [
    manaTapAbility("W"),
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, convoke: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
