import { defineCard } from "../define.js";

const TEXT = "Put a card from your hand on top of your library: Prevent all damage that would be dealt by target instant or sorcery spell this turn.";

// EDHREC rank 18609.
export default defineCard({
  name: "Hidden Retreat",
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
      targets: ["instant-or-sorcery-spell"],
      effect: { kind: "damage-rule", by: { target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
