import { defineCard } from "../define.js";

export default defineCard({
  name: "Ruthless Instincts",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Target nonattacking creature gains reach and deathtouch until end of turn. Untap it.\n• Target attacking creature gets +2/+2 and gains trample until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target nonattacking creature gains reach and deathtouch until end of turn. Untap it.",
        targets: [{ kind: "permanent", filter: { type: "creature", attacking: false } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
            { kind: "untap", target: 0 },
          ],
        },
      },
      {
        text: "Target attacking creature gets +2/+2 and gains trample until end of turn.",
        targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
