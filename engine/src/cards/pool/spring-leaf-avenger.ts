import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// EDHREC rank 7992.
//
// Rulings:
//   [2022-02-18] Although the Ninja is attacking, it was never declared as an attacking creature
//     (for purposes of abilities that trigger whenever a creature attacks, for example).
//   [2022-02-18] The creature with ninjutsu enters the battlefield attacking the same player or
//     planeswalker that the returned creature was attacking.
const HIT =
  "Whenever this creature deals combat damage to a player, return target permanent card from your graveyard to your hand.";

export default defineCard({
  name: "Spring-Leaf Avenger",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Ninja"],
  power: 6,
  toughness: 5,
  text: `${ninjutsuText("{3}{G}")}\n${HIT}`,
  activated: [ninjutsu("{3}{G}")],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: HIT,
    },
  ],
});
