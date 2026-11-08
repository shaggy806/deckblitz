import { defineCard } from "../define.js";

// The Equipment is chosen as this resolves, not targeted. "If you do": the
// delayed unattach is set up only once it is attached to that creature.
export default defineCard({
  name: "Unexpected Request",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. You may attach an Equipment you control to that creature. If you do, unattach it at the beginning of the next end step.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "choose-permanents",
        filter: { subtype: "Equipment", controlledBy: "you" },
        upTo: 1,
        keepTargets: true,
        prompt: "You may attach an Equipment you control to that creature",
        then: {
          kind: "sequence",
          effects: [
            { kind: "attach", target: 1, attachment: 0 },
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { attachedToObject: 1 } },
              then: {
                kind: "delayed-trigger",
                at: "next-end-step",
                effect: { kind: "unattach", target: 0 },
                text: "At the beginning of the next end step, unattach that Equipment.",
              },
            },
          ],
        },
      },
    ],
  },
});
