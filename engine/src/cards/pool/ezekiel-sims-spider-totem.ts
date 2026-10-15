import { defineCard } from "../define.js";

const COMBAT_TEXT = "At the beginning of combat on your turn, target Spider you control gets +2/+2 until end of turn.";

export default defineCard({
  name: "Ezekiel Sims, Spider-Totem",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Advisor"],
  power: 3,
  toughness: 5,
  keywords: ["reach"],
  text: `Reach\n${COMBAT_TEXT}`,
  triggered: [
    {
      // Battle Plan's trigger, on a Spider you control — Ezekiel is one.
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Spider" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
