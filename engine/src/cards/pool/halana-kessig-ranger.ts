import { defineCard } from "../define.js";

// EDHREC rank 10366.
//
// Rulings:
//   [2020-11-10] For the creature that entered the battlefield, use its power as Halana's
//     reflexive triggered ability resolves to determine how much damage is dealt. If it's no
//     longer on the battlefield at that time, use its power as it last existed on the battlefield.
//   [2020-11-10] Halana, Kessig Ranger's triggered ability goes on the stack without a target.
//     While that ability is resolving, you may pay {2}. If you do, a second ability triggers and
//     you pick a target that will be dealt damage.
//
// Itzquinth's "you may pay {2}. When you do" shape; the entering creature is
// the trigger object, which deals the damage (Warstorm Surge's `from`).

const TEXT =
  "Whenever another creature you control enters, you may pay {2}. When you do, that creature deals damage equal to its power to target creature.";

export default defineCard({
  name: "Halana, Kessig Ranger",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer", "Ranger"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  pairing: { kind: "partner" },
  text: `Reach\n${TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to have that creature deal damage equal to its power to target creature?",
        cost: "{2}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: { kind: "damage", target: 0, amount: { powerOf: "trigger-object" }, from: "trigger-object" },
          text: "That creature deals damage equal to its power to target creature.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
