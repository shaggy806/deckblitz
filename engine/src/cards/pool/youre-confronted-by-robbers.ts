import { defineCard } from "../define.js";

const STALL_TEXT = "Stall for Time — Tap up to three target creatures.";
const AID_TEXT = "Call for Aid — Create three 1/1 white Soldier creature tokens.";

export default defineCard({
  name: "You're Confronted by Robbers",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one —\n• ${STALL_TEXT}\n• ${AID_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: STALL_TEXT,
        // An any-number group can't sit in a mode: three optional slots,
        // each a different creature (rule 601.2c), as Urza's Rebuff's two.
        targets: [
          { kind: "optional", of: "creature" },
          { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
          { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
        ],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "tap", target: 1 },
            { kind: "tap", target: 2 },
          ],
        },
      },
      {
        text: AID_TEXT,
        targets: [],
        effect: { kind: "create-token", token: "Soldier Token", count: 3 },
      },
    ],
  },
});
