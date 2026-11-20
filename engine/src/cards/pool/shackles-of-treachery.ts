import { defineCard } from "../define.js";

// Act of Treason with a rider: the stolen creature gains, until end of turn, a
// triggered ability whose target is "Equipment attached to **it**" — the
// creature the granted ability is on, which is the ability's source
// (`attachedTo: { isSource: true }`, read against the trigger's source as its
// target is chosen). With no Equipment attached, the trigger has no legal
// target and is removed from the stack (rule 603.3d).

const GRANTED = "Whenever this creature deals damage, destroy target Equipment attached to it.";

export default defineCard({
  name: "Shackles of Treachery",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Gain control of target creature until end of turn. Untap that creature. Until end of turn, it gains haste and "${GRANTED}"`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "deals-damage", who: "self" },
          targets: [{ kind: "permanent", filter: { subtype: "Equipment", attachedTo: { isSource: true } } }],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: GRANTED,
        },
      },
    ],
  },
});
