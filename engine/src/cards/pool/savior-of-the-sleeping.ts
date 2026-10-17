import { defineCard } from "../define.js";

// EDHREC rank 23261. Wilds of Eldraine. "Put into a graveyard from the
// battlefield" is the `dies` trigger for any permanent (Disciple of the
// Vault's artifacts); an enchantment token counts, since it goes to the
// graveyard before it ceases to exist (its ruling).
const COUNTER_TEXT =
  "Whenever an enchantment you control is put into a graveyard from the battlefield, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Savior of the Sleeping",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
