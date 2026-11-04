import { defineCard } from "../define.js";

const TEXT = "Whenever a -1/-1 counter is put on a creature, you may create a 1/1 green Elf Warrior creature token.";

export default defineCard({
  name: "Flourishing Defenses",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "counters-put", who: "any", filter: { type: "creature" }, counter: "-1/-1", perCounter: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 green Elf Warrior creature token?",
        effect: { kind: "create-token", token: "Elf Warrior Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
