import { defineCard } from "../define.js";

// EDHREC rank 28681. Visions.
//
// Both triggers are the dealing end aimed at this creature (`deals-damage`
// `to: "self"`), so the source is the trigger object: "that creature" is it,
// and "that spell's controller" is `"trigger-controller"` (who controlled it
// as it dealt the damage, Phyrexian Obliterator's). A creature source is a
// permanent dealing the damage; a spell is `isSpell` as it deals it — an
// ability's damage comes from its source permanent, so a creature's ability
// (a Prodigal Pyromancer) is "a creature" and a noncreature permanent's
// ability is neither. Tephraderm deals the damage back even if it's dealt
// lethal damage: it's read as it last existed.

const CREATURE_TEXT = "Whenever a creature deals damage to this creature, this creature deals that much damage to that creature.";
const SPELL_TEXT = "Whenever a spell deals damage to this creature, this creature deals that much damage to that spell's controller.";

export default defineCard({
  name: "Tephraderm",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 5,
  text: `${CREATURE_TEXT}\n${SPELL_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "self", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, target: "trigger-object" },
      resolve: null,
      text: CREATURE_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "any", to: "self", filter: { isSpell: true } },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "trigger-controller" },
      resolve: null,
      text: SPELL_TEXT,
    },
  ],
});
