import { defineCard } from "../define.js";

export default defineCard({
  name: "Rise to Glory",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Return target creature card from your graveyard to the battlefield.\n• Return target Aura card from your graveyard to the battlefield.",
  // Modes are performed in order, so the Aura may enchant the creature the
  // first mode returned (the ruling); it chooses what to enchant as it enters
  // (rule 303.4f).
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Return target creature card from your graveyard to the battlefield.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      {
        text: "Return target Aura card from your graveyard to the battlefield.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "enchantment", subtype: "Aura" } }],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
    ],
  },
});
