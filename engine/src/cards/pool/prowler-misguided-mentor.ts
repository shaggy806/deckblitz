import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever Prowler deals combat damage to a player, put a +1/+1 counter on another target creature you control.";

export default defineCard({
  name: "Prowler, Misguided Mentor",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 3,
  toughness: 3,
  text: `Prowler can't be blocked by creatures with power 2 or less.\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "lte", n: 2 } } }],
      text: "Prowler can't be blocked by creatures with power 2 or less.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
