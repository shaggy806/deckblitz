import { defineCard } from "../define.js";

// EDHREC rank 23001. Teamwork 3 (rule 702.194): "cast using teamwork" is the
// spell being kicked, and "choose both instead" is `kickedModes` (Go Nuts!'s
// shape). Each mode has its own "target creature", so with teamwork they may
// be the same creature or two different ones (rule 115.3).
const DEATHTOUCH_MODE = "Target creature gains deathtouch until end of turn.";
const SHRINK_MODE = "Target creature gets -2/-2 until end of turn.";

export default defineCard({
  name: "Widow's Bite",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  kicker: { cost: "", keyword: "teamwork", teamwork: 3 },
  text:
    "Teamwork 3 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 3 or more.)\n" +
    "Choose one. If this spell was cast using teamwork, choose both instead.\n" +
    `• ${DEATHTOUCH_MODE}\n• ${SHRINK_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: DEATHTOUCH_MODE,
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      },
      {
        text: SHRINK_MODE,
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      },
    ],
  },
});
