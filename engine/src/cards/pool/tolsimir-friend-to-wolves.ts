import { defineCard } from "../define.js";

const VOJA_TEXT =
  "When Tolsimir enters, create Voja, Friend to Elves, a legendary 3/3 green and white Wolf creature token.";
const WOLF_TEXT =
  "Whenever a Wolf you control enters, you gain 3 life and that creature fights up to one target creature you don't control.";

// With no target chosen, you just gain 3 life; a chosen target that's gone
// illegal stops the whole ability (rule 608.2b — the ruling). A Wolf that has
// left by then fights nothing, and you still gain the life.
export default defineCard({
  name: "Tolsimir, Friend to Wolves",
  manaCost: "{2}{G}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 3,
  toughness: 3,
  text: `${VOJA_TEXT}\n${WOLF_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Voja, Friend to Elves", count: 1 },
      resolve: null,
      text: VOJA_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", subtype: "Wolf" } },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "fight", a: "trigger-object", b: 0 },
        ],
      },
      resolve: null,
      text: WOLF_TEXT,
    },
  ],
});
