import { defineCard } from "../define.js";

// Activated during end of combat, after combat damage, the creature has
// already dealt its damage and only untaps (the reminder text).

const TEXT = "{0}: Remove target attacking creature you control from combat and untap it.";

export default defineCard({
  name: "Reconnaissance",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${TEXT} (If you activate during end of combat, the creature will untap after it deals combat damage.)`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-from-combat", target: 0 },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
