import { defineCard } from "../define.js";

const LOCK = "Enchanted permanent can't attack or block, and its activated abilities can't be activated.";
const FREE = "{3}: Destroy this Aura. Only your opponents may activate this ability and only as a sorcery.";

export default defineCard({
  name: "Detention Vortex",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant nonland permanent\n${LOCK}\n${FREE}`,
  targets: ["nonland-permanent"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: LOCK,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "destroy", target: "source" },
      anyPlayer: true,
      onlyOpponents: true,
      sorcerySpeed: true,
      resolve: null,
      text: FREE,
    },
  ],
});
