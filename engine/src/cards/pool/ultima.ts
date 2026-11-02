import { defineCard } from "../define.js";

// Rule 724.1a: what dies to the first sentence triggers before the turn ends,
// so its dies triggers cease to exist unplaced.
export default defineCard({
  name: "Ultima",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Destroy all artifacts and creatures. End the turn. (Exile all spells and abilities from the stack, including this card. The player whose turn it is discards down to their maximum hand size. Damage wears off, and "this turn" and "until end of turn" effects end.)`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "creature"] } },
      { kind: "end-the-turn" },
    ],
  },
});
