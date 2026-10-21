import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, create a 1/1 blue Illusion creature token with flying.";

export default defineCard({
  name: "Moonblade Shinobi",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 3,
  toughness: 2,
  text: `${ninjutsuText("{2}{U}")}\n${DAMAGE_TEXT}`,
  activated: [ninjutsu("{2}{U}")],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Illusion Token (Flying)", count: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
