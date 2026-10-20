import { defineCard } from "../define.js";

const SLAY_TEXT = "Whenever this creature deals damage to a Vampire, destroy that creature.";

export default defineCard({
  name: "Vampire Slayer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: SLAY_TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", toFilter: { subtype: "Vampire" } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient" },
      resolve: null,
      text: SLAY_TEXT,
    },
  ],
});
