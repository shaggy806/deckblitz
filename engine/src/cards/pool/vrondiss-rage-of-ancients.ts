import { defineCard } from "../define.js";

// EDHREC rank 11000. The 1 damage is Vrondiss's own, dealt to itself, which
// sets off its enrage.
const ENRAGE_TEXT =
  "Enrage — Whenever Vrondiss is dealt damage, you may create a 5/4 red and green Dragon Spirit creature token with \"When this token deals damage, sacrifice it.\"";
const DICE_TEXT = "Whenever you roll one or more dice, you may have Vrondiss deal 1 damage to itself.";

export default defineCard({
  name: "Vrondiss, Rage of Ancients",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Barbarian"],
  power: 5,
  toughness: 4,
  text: `${ENRAGE_TEXT}\n${DICE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 5/4 Dragon Spirit token?",
        effect: { kind: "create-token", token: "Dragon Spirit Token (Sacrifice When It Deals Damage)", count: 1 },
      },
      resolve: null,
      text: ENRAGE_TEXT,
    },
    {
      trigger: { on: "rolls-dice", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Vrondiss deal 1 damage to itself?",
        effect: { kind: "damage", amount: 1, target: "source" },
      },
      resolve: null,
      text: DICE_TEXT,
    },
  ],
});
