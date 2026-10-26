import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19511.

export default defineCard({
  name: "Shinewend",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Flying\nThis creature enters with a +1/+1 counter on it.\n{1}{W}, Remove a +1/+1 counter from this creature: Destroy target enchantment.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{1}{W}, Remove a +1/+1 counter from this creature: Destroy target enchantment.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
});
