import { defineCard } from "../define.js";

// EDHREC rank 7126. Each of your cascades, after the last card is exiled and
// before you choose whether to cast the card found (or with nothing found,
// before the rest go to the bottom — its ruling); not a land play, so it works
// with your land play used or on another player's turn (its rulings).
export default defineCard({
  name: "Averna, the Chaos Bloom",
  manaCost: "{G}{U}{R}",
  colors: ["G", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 4,
  toughness: 2,
  text: "As you cascade, you may put a land card from among the exiled cards onto the battlefield tapped. (Do this after the last card is exiled but before deciding whether to cast a nonland card.)",
  static: [
    {
      affects: { scope: "self" },
      asYouCascade: {
        kind: "look-and-choose",
        zone: "exiled-this-way",
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
        prompt: "Averna: you may put a land card from among the exiled cards onto the battlefield tapped",
      },
      text: "As you cascade, you may put a land card from among the exiled cards onto the battlefield tapped.",
    },
  ],
});
