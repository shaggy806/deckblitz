import { defineCard } from "../define.js";

// EDHREC rank 11724. "Remove a counter" is a counter of any kind.

const ACTIVATE_TEXT =
  "{T}, Remove a counter from The Duke: Put a +1/+1 counter on another target creature you control. It gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "The Duke, Rebel Sentry",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Ally"],
  power: 0,
  toughness: 1,
  text: `The Duke enters with a +1/+1 counter on him.\n${ACTIVATE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "The Duke enters with a +1/+1 counter on him.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "any", count: 1 } },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ACTIVATE_TEXT,
    },
  ],
});
