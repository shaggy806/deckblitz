import { defineCard } from "../define.js";

const LOCK_TEXT = "Enchanted creature can't attack or block.";
const EXILE_TEXT =
  "{5}, Sacrifice this Aura: Exile enchanted creature. You create a 1/1 black Ninja creature token. Activate only as a sorcery.";

export default defineCard({
  name: "Uneasy Alliance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${LOCK_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["cant-attack", "cant-block"], text: LOCK_TEXT }],
  activated: [
    {
      cost: { mana: "{5}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "attached" },
          // A plain 1/1 black Ninja — the token file is named for the card that added it first.
          { kind: "create-token", token: "Ninja Token (Dark Leo & Shredder)", count: 1 },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
      sorcerySpeed: true,
    },
  ],
});
