import { defineCard } from "../define.js";

// EDHREC rank 14068.
// Poison Breath sets up a delayed triggered ability for the rest of the turn
// (rule 603.7c), so it keeps working once the Dragon has left (the ruling).
// It destroys after the damage, as a trigger — not deathtouch: lethal damage
// to a blocker still has to be assigned in full before the next (the
// ruling).
const BREATH_TEXT =
  "Poison Breath — When this creature enters, until end of turn, whenever a creature an opponent controls is dealt damage, destroy it.";

export default defineCard({
  name: "Green Dragon",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${BREATH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "dealt-damage", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
        },
        effect: { kind: "destroy", target: "trigger-object" },
        text: "Whenever a creature an opponent controls is dealt damage, destroy it.",
      },
      resolve: null,
      text: BREATH_TEXT,
    },
  ],
});
