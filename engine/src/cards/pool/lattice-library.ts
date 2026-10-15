import { defineCard } from "../define.js";

// EDHREC rank 9665. Secrets of Strixhaven Commander.
//
// "Your first spell with {X} in its mana cost each turn" is asked of every
// spell you cast this turn, Lattice Library itself included (the ruling): cast
// with X, it uses the turn's first, so a later {X} spell that turn doesn't
// trigger it. The study counters are read as the token's counters are put —
// as the Library last existed if it has left (rule 608.2h).
const ENTERS_TEXT = "This enchantment enters with X study counters on it.";
const TOKEN_TEXT =
  "When this enchantment enters and whenever you cast your first spell with {X} in its mana cost each turn, create a 0/0 green and blue Fractal creature token. Put a number of +1/+1 counters on it equal to the number of study counters on this enchantment.";

const FRACTAL = {
  kind: "create-token",
  token: "Fractal Token",
  count: 1,
  thenCounters: { kind: "+1/+1", amount: { countersOn: "source", counter: "study" } },
} as const;

export default defineCard({
  name: "Lattice Library",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "study", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: FRACTAL,
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true, filter: { xInManaCost: true } },
      targets: [],
      effect: FRACTAL,
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
