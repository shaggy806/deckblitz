import { defineCard } from "../define.js";

// The front face; the back is Gideon, Battle-Forged (gideon-battle-forged.ts).
const END_COMBAT =
  "At end of combat, if Kytheon and at least two other creatures attacked this combat, exile Kytheon, then return him to the battlefield transformed under his owner's control.";
const INDESTRUCTIBLE = "{2}{W}: Kytheon gains indestructible until end of turn.";

export default defineCard({
  name: "Kytheon, Hero of Akros",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: `${END_COMBAT}\n${INDESTRUCTIBLE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      // Creatures that attacked this combat and have since left still count;
      // ones put onto the battlefield attacking never attacked (the ruling).
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { attackedThisCombat: true } },
          { kind: "turn-history", what: "attackers", who: "any-player", filter: { attackedThisCombat: true }, atLeast: 3 },
        ],
      },
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: END_COMBAT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: INDESTRUCTIBLE,
    },
  ],
  faces: ["Kytheon, Hero of Akros", "Gideon, Battle-Forged"],
  transform: true,
});
