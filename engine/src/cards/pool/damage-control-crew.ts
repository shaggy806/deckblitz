import { defineCard } from "../define.js";

const REPAIR = "• Repair — Return target card with mana value 4 or greater from your graveyard to your hand.";
const IMPOUND = "• Impound — Exile target artifact or enchantment.";
const TEXT = `When this creature enters, choose one —\n${REPAIR}\n${IMPOUND}`;

export default defineCard({
  name: "Damage Control Crew",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      // The mode is announced as the trigger goes on the stack, with its
      // target (rule 700.2b) — The Mightstone and Weakstone's shape.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: REPAIR,
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { manaValue: { op: "gte", n: 4 } } }],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
          {
            text: IMPOUND,
            targets: ["artifact-or-enchantment"],
            effect: { kind: "exile", target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
