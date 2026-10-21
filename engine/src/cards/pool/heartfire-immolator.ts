import { defineCard } from "../define.js";

// EDHREC rank 14468.
//
// Rulings:
//   [2020-06-23] Players can't take any actions between the time you begin to activate Heartfire
//     Immolator's last ability and the time it's sacrificed.
//   [2020-06-23] Use Heartfire Immolator's power as it last existed on the battlefield to
//     determine how much damage its last ability deals.
//
// Voldaren Thrillseeker's sacrifice shape: "it" is the sacrificed creature, its
// power read as it last existed.

const SAC_TEXT = "{R}, Sacrifice this creature: It deals damage equal to its power to target creature or planeswalker.";

export default defineCard({
  name: "Heartfire Immolator",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
  ],
});
