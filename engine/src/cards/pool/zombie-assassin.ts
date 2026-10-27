import { defineCard } from "../define.js";

// EDHREC rank 30650.

const TEXT =
  "{T}, Exile two cards from your graveyard and this creature: Destroy target nonblack creature. It can't be regenerated.";

export default defineCard({
  name: "Zombie Assassin",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Assassin"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: 2 }, exileSelf: true },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
