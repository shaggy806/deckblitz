import { defineCard } from "../define.js";

// EDHREC rank 1321.
//
// It copies the target's copiable values — what that is copying, if
// anything — not its counters or the effects that animated it (rule 707.2,
// the rulings), and stays the same permanent: tapped or not, its counters
// and the effects already on it (707.4). Once the ability resolves it no
// longer has it, and in the cleanup step every instance ends at once (rule
// 514.2): it's Mirage Mirror again. Copying an Aura it isn't attached to, it
// goes to the graveyard (rule 704.5m); copying an Equipment, the legend rule
// and the rest apply as they would.
const TEXT =
  "{2}: This artifact becomes a copy of target artifact, creature, enchantment, or land until end of turn.";

export default defineCard({
  name: "Mirage Mirror",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land"] } }],
      effect: { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
