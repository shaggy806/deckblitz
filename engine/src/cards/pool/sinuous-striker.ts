import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

// EDHREC rank 30084. Eternalize with a discard added to its cost, as
// Sunscourge Champion's.
const PUMP = "{U}: This creature gets +1/-1 until end of turn.";
const ETERNALIZE_TEXT =
  "Eternalize—{3}{U}{U}, Discard a card. ({3}{U}{U}, Discard a card, Exile this card from your graveyard: " +
  "Create a token that's a copy of it, except it's a 4/4 black Zombie Snake Warrior with no mana cost. " +
  "Eternalize only as a sorcery.)";

export default defineCard({
  name: "Sinuous Striker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${PUMP}\n${ETERNALIZE_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
    {
      ...eternalizeAbility("{3}{U}{U}", ETERNALIZE_TEXT),
      cost: { mana: "{3}{U}{U}", tap: false, discard: { count: 1 } },
    },
  ],
});
