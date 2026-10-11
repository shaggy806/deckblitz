import { defineCard } from "../define.js";

// "Put into **your** graveyard": an Elf you own, whoever controlled it — a
// stolen Elf of yours counts, an Elf of theirs you'd taken doesn't.

const TEXT =
  "Whenever another nontoken Elf is put into your graveyard from the battlefield, you may create a 1/1 green Elf Warrior creature token.";

export default defineCard({
  name: "Prowess of the Fair",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["kindred", "enchantment"],
  subtypes: ["Elf"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { subtype: "Elf", token: false, ownedBy: "you" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 green Elf Warrior token?",
        effect: { kind: "create-token", token: "Elf Warrior Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
