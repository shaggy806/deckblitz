import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 26468. Devouring Greed's
// "sacrifice any number of Spirits" (X announced as it's cast, none at all
// included): +3/+0 plus +3/+0 for each Spirit sacrificed this way.

const TEXT =
  "As an additional cost to cast this spell, you may sacrifice any number of Spirits.\nTarget creature gets +3/+0 until end of turn. For each Spirit sacrificed this way, that creature gets an additional +3/+0 until end of turn.";

export default defineCard({
  name: "Devouring Rage",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: TEXT,
  additionalCost: { sacrifice: { subtype: "Spirit" }, sacrificeCount: "x" },
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { sum: [3, { product: [3, "x"] }] },
    toughness: 0,
    duration: "end-of-turn",
  },
});
