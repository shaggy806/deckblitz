import { defineCard } from "../define.js";

const TEXT =
  "Each player chooses from among the permanents they control an artifact, a creature, an enchantment, and a land, then sacrifices the rest.";

/** An artifact creature may be chosen as either or both (the rulings). A
 * planeswalker that's none of the four goes with the rest. */
export default defineCard({
  name: "Cataclysm",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-one-of-each",
    who: "each-player",
    slots: ["artifact", "creature", "enchantment", "land"],
    filter: {},
    rest: "sacrifice",
    prompt: "Choose an artifact, a creature, an enchantment, and a land to keep — the rest are sacrificed",
  },
});
