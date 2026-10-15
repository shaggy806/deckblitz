import { defineCard } from "../define.js";

// EDHREC rank 23076. Teamwork 4 (rule 702.194): "cast using teamwork" is the
// spell being kicked, "choose both instead" its `kickedModes`. "One or two
// target nonland permanents" is a first target and up to one other (Get
// Out's shape), returned as one event.
const TOKEN_MODE = "Target player creates a 6/5 blue Leviathan creature token with hexproof.";
const BOUNCE_MODE = "Return one or two target nonland permanents to their owners' hands.";

export default defineCard({
  name: "Atlantis Attacks",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "teamwork", teamwork: 4 },
  text:
    "Teamwork 4 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 4 or more.)\n" +
    "Choose one. If this spell was cast using teamwork, choose both instead.\n" +
    `• ${TOKEN_MODE}\n• ${BOUNCE_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: TOKEN_MODE,
        targets: ["player"],
        effect: { kind: "create-token", token: "Leviathan Token", count: 1, who: "target-controller" },
      },
      {
        text: BOUNCE_MODE,
        targets: [
          "nonland-permanent",
          { kind: "optional", of: { kind: "other", of: "nonland-permanent", than: { slot: 0 } } },
        ],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0 },
            { kind: "return-to-hand", target: 1 },
          ],
        },
      },
    ],
  },
});
