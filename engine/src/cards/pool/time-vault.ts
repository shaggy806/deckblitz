import { defineCard } from "../define.js";

// Rulings: the choice is made as that turn would begin, and only if this is
// tapped then. If you skip it, this untaps before anything else happens in the
// next turn (rule 614.10b).
export default defineCard({
  name: "Time Vault",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text:
    "This artifact enters tapped.\n" +
    "This artifact doesn't untap during your untap step.\n" +
    "If you would begin your turn while this artifact is tapped, you may skip that turn instead. If you do, untap this artifact.\n" +
    "{T}: Take an extra turn after this one.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This artifact doesn't untap during your untap step.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: true } },
      replacement: { event: "would-begin-turn", who: "you", may: true, thenUntapSource: true },
      text: "If you would begin your turn while this artifact is tapped, you may skip that turn instead. If you do, untap this artifact.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: "{T}: Take an extra turn after this one.",
    },
  ],
});
