import { defineCard } from "../define.js";

const CAST_TEXT = "You may cast this card from your graveyard or from exile.";

// Its own permission over both zones, for its normal cost and timing (its
// rulings); it never stops Squee being cast from anywhere else.
export default defineCard({
  name: "Squee, the Immortal",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  text: CAST_TEXT,
  mayPlaySelf: { from: ["graveyard", "exile"] },
});
