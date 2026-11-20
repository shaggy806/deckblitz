import { defineCard } from "../define.js";
// EDHREC rank 17882.
//
// The trigger is a `becomes-attached` one only as the Aura enters attached (`asEnters`): its
// trigger object is the creature it entered on, so moved before the trigger resolves, it's still
// that first creature they copy (the ruling), as it is then or as it last existed. They copy only
// copiable values (rule 707.2), and none of the copies end if the Aura leaves (rule 611.2a).
// "Each other": not that creature itself. The static is Essence of the Wild's copy-on-enter
// replacement, of the enchanted creature; a token copy entering isn't nontoken.
const TRIGGER_TEXT =
  "When this Aura enters attached to a creature, each other nontoken creature you control becomes a copy of that creature.";
const STATIC_TEXT = "Nontoken creatures you control enter as a copy of enchanted creature.";
export default defineCard({
  name: "Infinite Reflection",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature"],
  text: `Enchant creature\n${TRIGGER_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-attached", who: "self", asEnters: true, filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "become-copy",
        filter: { type: "creature", token: false, controlledBy: "you" },
        exceptOf: true,
        of: "trigger-object",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", token: false, controlledBy: "you" },
        asCopyOf: "enchanted",
      },
      text: STATIC_TEXT,
    },
  ],
});
