import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 29898. Circle of Protection: Black and Red in
// one: the source of your choice is chosen as the ability resolves, among
// the black or red permanents and spells (rule 609.7a), and checked again
// for the colour when the damage would be dealt (609.7b).

const TEXT =
  "{1}{W}: The next time a black or red source of your choice would deal damage to you this turn, prevent that damage.";

export default defineCard({
  name: "Greater Realm of Preservation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
        to: "you",
        amount: "next-time",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
