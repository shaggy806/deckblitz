import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 24279.
//
// Rulings:
//   [2006-09-25] When damage is dealt to Phyrexian Totem, its triggered ability will trigger. A
//     number of permanents equal to the amount of damage dealt will be sacrificed when the ability
//     resolves. It doesn't matter if Phyrexian Totem isn't on the battlefield when the ability
//     resolves, as long as Phyrexian Totem was a creature as it left the battlefield. If one of
//     the permanents sacrificed is Phyrexian Totem itself, the requisite number of other
//     permanents must still be sacrificed.
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.
//
// Body of Knowledge's "that many" (the damage, `triggerValue`), Opal
// Gargoyle's intervening-if on the source's type.

const ANIMATE_TEXT =
  "{2}{B}: This artifact becomes a 5/5 black Phyrexian Horror artifact creature with trample until end of turn.";
const DAMAGE_TEXT = "Whenever this permanent is dealt damage, if it's a creature, sacrifice that many permanents.";

export default defineCard({
  name: "Phyrexian Totem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {B}.\n${ANIMATE_TEXT}\n${DAMAGE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 5,
        toughness: 5,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Phyrexian", "Horror"],
        setColors: ["B"],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      condition: { kind: "source", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: {}, count: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
