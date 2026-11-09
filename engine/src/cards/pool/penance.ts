import { defineCard } from "../define.js";

const TEXT =
  "Put a card from your hand on top of your library: The next time a black or red source of your choice would deal damage this turn, prevent that damage.";

// EDHREC rank 10058.
export default defineCard({
  name: "Penance",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        do: { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "library-top", leftover: "stay" },
      },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
        to: "any",
        amount: "next-time",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
