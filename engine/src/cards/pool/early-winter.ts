import { defineCard } from "../define.js";

// EDHREC rank 15718. Only the opponent is targeted in the second mode: the
// enchantment is theirs to choose as the spell resolves (Imperial Edict's shape).

export default defineCard({
  name: "Early Winter",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Exile target creature.\n• Target opponent exiles an enchantment they control.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Exile target creature.", targets: ["creature"], effect: { kind: "exile", target: 0 } },
      {
        text: "Target opponent exiles an enchantment they control.",
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "vote",
              choose: true,
              who: { target: 0 },
              for: { permanent: { type: "enchantment", controlledBy: "you" }, own: true },
            },
            { kind: "for-each-voted", which: "voted", effect: { kind: "exile", target: 0 } },
          ],
        },
      },
    ],
  },
});
