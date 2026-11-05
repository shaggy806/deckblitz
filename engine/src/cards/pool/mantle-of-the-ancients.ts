import { defineCard } from "../define.js";

// Top-5000 #1409. Those that can't be attached stay in the graveyard (Auras,
// the ruling); "enchanted creature" is read as it resolves, as it last existed
// if the Aura has left.
const ENTER_TEXT =
  "When this Aura enters, return any number of target Aura and/or Equipment cards from your graveyard to the battlefield attached to enchanted creature.";
const PUMP_TEXT = "Enchanted creature gets +1/+1 for each Aura and Equipment attached to it.";

export default defineCard({
  name: "Mantle of the Ancients",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${ENTER_TEXT}\n${PUMP_TEXT}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { subtypes: ["Aura", "Equipment"] } },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0, attachedTo: "attached" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        filter: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } },
        relativeToAffected: true,
        pt: [1, 1],
      },
      text: PUMP_TEXT,
    },
  ],
});
