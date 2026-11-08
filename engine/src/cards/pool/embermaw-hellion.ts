import { defineCard } from "../define.js";

const TEXT =
  "If another red source you control would deal damage to a permanent or player, it deals that much damage plus 1 to that permanent or player instead.";

export default defineCard({
  name: "Embermaw Hellion",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 4,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { modify: { plus: 1 } },
        fromOther: true,
        source: { colors: ["R"], controlledBy: "you" },
      },
      text: TEXT,
    },
  ],
});
