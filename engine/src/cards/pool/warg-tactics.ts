import { defineCard } from "../define.js";

// EDHREC rank 15294.

export default defineCard({
  name: "Warg Tactics",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target creature with flying.\n• Put a +1/+1 counter on target creature you control. It gains trample and hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Put a +1/+1 counter on target creature you control. It gains trample and hexproof until end of turn.",
        targets: ["creature-you-control"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
