import { defineCard } from "../define.js";

// EDHREC rank 21861.
//
// Vow to Erebor's shape: "you may attach an Equipment" is a choice of up to
// one as it resolves, none being "you don't".

export default defineCard({
  name: "Resolute Strike",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If it's a Warrior, you may attach an Equipment you control to it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Warrior" } },
        then: {
          kind: "attach",
          target: 0,
          choose: {
            filter: { subtype: "Equipment", controlledBy: "you" },
            prompt: "You may attach an Equipment you control to it",
            upTo: 1,
          },
        },
      },
    ],
  },
});
