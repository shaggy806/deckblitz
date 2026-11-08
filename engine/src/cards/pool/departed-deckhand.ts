import { defineCard } from "../define.js";

const TARGET_TEXT = "When this creature becomes the target of a spell, sacrifice it.";
const EVASION_TEXT = "This creature can't be blocked except by Spirits.";
const ABILITY_TEXT = "{3}{U}: Another target creature you control can't be blocked this turn except by Spirits.";

export default defineCard({
  name: "Departed Deckhand",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Pirate"],
  power: 2,
  toughness: 2,
  text: TARGET_TEXT + "\n" + EVASION_TEXT + "\n" + ABILITY_TEXT,
  static: [
    { affects: { scope: "self" }, restrictions: [{ kind: "cant-be-blocked", by: { notSubtypes: ["Spirit"] } }], text: EVASION_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "restrict", target: 0, restrictions: [{ kind: "cant-be-blocked", by: { notSubtypes: ["Spirit"] } }] },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
