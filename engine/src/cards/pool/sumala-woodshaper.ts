import { defineCard } from "../define.js";

// EDHREC rank 24548. Guilds of Ravnica. Arcanist's Owl's look-at-four, for a
// creature or enchantment card.

const ETB_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal a creature or enchantment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Sumala Woodshaper",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 1,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["creature", "enchantment"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
