import { defineCard } from "../define.js";

// "All suspected creatures" is every player's. The dies trigger's target is
// optional; one chosen that's illegal as it resolves stops the whole ability,
// life gain included (the ruling, rule 608.2b).

const ENTER_TEXT = "When this creature enters, all suspected creatures are no longer suspected.";
const DIES_TEXT =
  "When this creature dies, you gain 3 life and suspect up to one target creature an opponent controls.";

export default defineCard({
  name: "Absolving Lammasu",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Lammasu"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${DIES_TEXT} (A suspected creature has menace and can't block.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "unsuspect", filter: { type: "creature", suspected: true } },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "suspect", target: 0 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
