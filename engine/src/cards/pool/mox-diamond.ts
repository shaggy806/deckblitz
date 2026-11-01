import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const TEXT =
  "If this artifact would enter, you may discard a land card instead. If you do, put this artifact onto the " +
  "battlefield. If you don't, put it into its owner's graveyard.";

// Not discarding, it never enters: nothing sees it arrive and it can't be
// tapped for mana first (its ruling).
export default defineCard({
  name: "Mox Diamond",
  manaCost: "{0}",
  types: ["artifact"],
  text: `${TEXT}\n{T}: Add one mana of any color.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", instead: { discard: { filter: { type: "land" } } } },
      text: TEXT,
    },
  ],
  activated: [addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." })],
});
