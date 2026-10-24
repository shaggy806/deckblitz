import { defineCard } from "../define.js";

// EDHREC rank 22556. Ardoz, Cobbler of War's shape: once per creature that
// enters, itself included (the ruling).
const ENTER_TEXT =
  "Whenever this creature or another creature you control enters, that creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Ambuscade Shaman",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Shaman"],
  power: 2,
  toughness: 2,
  dash: { cost: "{3}{B}" },
  text: `${ENTER_TEXT}\nDash {3}{B} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
