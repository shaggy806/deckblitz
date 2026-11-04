import { defineCard } from "../define.js";

const TEXT = "Whenever this creature deals 6 or more damage to an opponent, destroy target land that player controls.";

export default defineCard({
  name: "Deus of Calamity",
  manaCost: "{R/G}{R/G}{R/G}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent", atLeast: 6 },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
