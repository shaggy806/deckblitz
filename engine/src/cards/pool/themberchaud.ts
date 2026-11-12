import { defineCard } from "../define.js";

// EDHREC rank 12726. Earthquake's damage, X the Mountains you control as it
// resolves; Gust Walker's exert.

const ENTER_TEXT =
  "When Themberchaud enters, he deals X damage to each other creature without flying and each player, where X is the number of Mountains you control.";
const EXERT_TEXT = "You may exert Themberchaud as he attacks. When you do, he gains flying until end of turn.";
const X = { countOf: { subtype: "Mountain", controlledBy: "you" } } as const;

export default defineCard({
  name: "Themberchaud",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: X, exceptSource: true },
          { kind: "damage", amount: X, who: "each-player" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
