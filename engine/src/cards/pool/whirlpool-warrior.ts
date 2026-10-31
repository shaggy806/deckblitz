import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, shuffle the cards from your hand into your library, then draw that many cards.";
const SACRIFICE =
  "{R}, Sacrifice this creature: Each player shuffles the cards from their hand into their library, then draws that many cards.";

export default defineCard({
  name: "Whirlpool Warrior",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${ENTERS}\n${SACRIFICE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "shuffle-graveyard-into-library", target: "you", zones: ["hand"], drawThatMany: true },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand"], drawThatMany: true },
      resolve: null,
      text: SACRIFICE,
    },
  ],
});
