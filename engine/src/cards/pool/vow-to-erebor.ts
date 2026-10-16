import { defineCard } from "../define.js";

// EDHREC rank 15879.

export default defineCard({
  name: "Vow to Erebor",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Untap target creature you control. It gets +2/+2 until end of turn. If it's a Dwarf, you may attach an Equipment you control to it.",
  targets: ["creature-you-control"],
  // "You may attach an Equipment" is a choice of up to one, none being "you
  // don't"; one that can't equip it doesn't move (rule 701.3b).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Dwarf" } },
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
