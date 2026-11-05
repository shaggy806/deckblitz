import { defineCard } from "../define.js";

// One ability with two trigger events (blocks / becomes blocked), each once
// however many creatures are involved (the ruling); the creature to exile is
// chosen as it resolves, untargeted, among those blocking or blocked by the
// equipped creature. Exiled cards are linked to this Godsend (rule 607.2a), so
// a new Godsend doesn't see them.
const EXILE =
  "Whenever equipped creature blocks or becomes blocked by one or more creatures, you may exile one of those creatures.";
const LOCK = "Your opponents can't cast spells with the same name as a card exiled with Godsend.";
const EXILE_EFFECT = {
  kind: "choose-permanents",
  filter: { type: "creature", blockingRelation: { relation: "either", of: "host" } },
  min: 0,
  upTo: 1,
  prompt: "Exile one of those creatures?",
  then: { kind: "exile", target: 0, linked: true },
} as const;

export default defineCard({
  name: "Godsend",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +3/+3.\n${EXILE}\n${LOCK}\nEquip {3}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "blocks", who: "attached" },
      targets: [],
      effect: EXILE_EFFECT,
      resolve: null,
      text: EXILE,
    },
    {
      trigger: { on: "becomes-blocked", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: EXILE_EFFECT,
      resolve: null,
      text: EXILE,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPt: [3, 3], text: "Equipped creature gets +3/+3." },
    {
      affects: { scope: "self" },
      prohibits: { who: "opponents", spells: { sameNameWith: "exiled-with-source" } },
      text: LOCK,
    },
  ],
});
