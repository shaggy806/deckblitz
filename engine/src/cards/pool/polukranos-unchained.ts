import { defineCard } from "../define.js";

const ENTER_TEXT = "Polukranos enters with six +1/+1 counters on it. It escapes with twelve +1/+1 counters on it instead.";
const PREVENT_TEXT =
  "If damage would be dealt to Polukranos while it has a +1/+1 counter on it, prevent that damage and remove that many +1/+1 counters from it.";

// "Instead": escaped, it gets escape's twelve and not the six — the six are
// gated on it not having been cast with escape.

export default defineCard({
  name: "Polukranos, Unchained",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Hydra"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${PREVENT_TEXT}\n{1}{B}{G}: Polukranos fights another target creature.\nEscape—{4}{B}{G}, Exile six other cards from your graveyard.`,
  escape: { cost: "{4}{B}{G}", exileCount: 6, counters: { kind: "+1/+1", amount: 12 } },
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "source", filter: { castVia: "escape" } } },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 6 } },
      text: ENTER_TEXT,
    },
    {
      // More damage than counters: all of it prevented, every counter removed
      // (its ruling) — `remove-counter` takes what's there.
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        to: "self",
        then: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: "x" },
      },
      text: PREVENT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}{G}", tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature" } } }],
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: "{1}{B}{G}: Polukranos fights another target creature.",
    },
  ],
});
