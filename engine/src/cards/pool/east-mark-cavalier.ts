import { defineCard } from "../define.js";

// EDHREC rank 24876.
//
// Spider-Slayer, Hatred Honed's shape: any damage it deals to a Goblin or Orc
// creature, combat or not, and the creature dealt it is destroyed.

const TEXT = "Whenever this creature deals damage to a Goblin or Orc, destroy that creature.";

export default defineCard({
  name: "East-Mark Cavalier",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", toFilter: { subtypes: ["Goblin", "Orc"] } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient" },
      resolve: null,
      text: TEXT,
    },
  ],
});
