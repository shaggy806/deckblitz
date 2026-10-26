import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

const HIT = "Whenever this creature deals combat damage to a player, that player discards two cards.";

export default defineCard({
  name: "Okiba-Gang Shinobi",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Ninja"],
  power: 3,
  toughness: 2,
  text: `${ninjutsuText("{3}{B}")}\n${HIT}`,
  activated: [ninjutsu("{3}{B}")],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 2 },
      resolve: null,
      text: HIT,
    },
  ],
});
