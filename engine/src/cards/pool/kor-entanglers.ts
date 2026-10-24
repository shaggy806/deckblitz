import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 18512.

const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, tap target creature an opponent controls.";

export default defineCard({
  name: "Kor Entanglers",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier", "Ally"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
    targets: ["creature-an-opponent-controls"],
    effect: { kind: "tap", target: 0 },
    resolve: null,
    text: TEXT,
  }),
});
