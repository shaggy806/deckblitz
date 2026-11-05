import { defineCard } from "../define.js";

const ATTACK = "Whenever Squee attacks, create a 1/1 red Goblin creature token that's tapped and attacking.";
const GRAVEYARD =
  "You may cast this card from your graveyard by paying {3}{R} and exiling four other cards from your graveyard rather than paying its mana cost.";

export default defineCard({
  name: "Squee, Dubious Monarch",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Noble"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${ATTACK}\n${GRAVEYARD}`,
  // An alternative cost ({3}{R}) with an additional exile of four others.
  castSelfFromGraveyard: { mana: "{3}{R}", exileOthers: 4 },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 1, tapped: true, attacking: "choose" },
      resolve: null,
      text: ATTACK,
    },
  ],
});
