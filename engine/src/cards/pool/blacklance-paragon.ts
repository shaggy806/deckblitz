import { defineCard } from "../define.js";

const ENTER = "When this creature enters, target Knight gains deathtouch and lifelink until end of turn.";

export default defineCard({
  name: "Blacklance Paragon",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${ENTER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Any Knight, its own included (its ruling).
      targets: [{ kind: "permanent", filter: { subtype: "Knight" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER,
    },
  ],
});
