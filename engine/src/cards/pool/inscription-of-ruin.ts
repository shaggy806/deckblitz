import { defineCard } from "../define.js";

export default defineCard({
  name: "Inscription of Ruin",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {2}{B}{B}\nChoose one. If this spell was kicked, choose any number instead.\n• Target opponent discards two cards.\n• Return target creature card with mana value 2 or less from your graveyard to the battlefield.\n• Destroy target creature with mana value 3 or less.",
  kicker: { cost: "{2}{B}{B}" },
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: { min: 1, max: 3 },
    modes: [
      { text: "Target opponent discards two cards.", targets: ["opponent"], effect: { kind: "discard", target: 0, amount: 2 } },
      {
        text: "Return target creature card with mana value 2 or less from your graveyard to the battlefield.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } }],
        effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
      {
        text: "Destroy target creature with mana value 3 or less.",
        targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
