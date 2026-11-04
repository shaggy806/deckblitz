import { defineCard } from "../define.js";

// Banding lasts only that combat, then wears off.
const BEGIN_TEXT = "At the beginning of combat on your turn, this creature gains banding until end of combat.";
const WALL_TEXT = "Whenever this creature becomes blocked by a Wall, destroy that Wall at end of combat.";
const REMINDER =
  "(Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's blocking.)";

export default defineCard({
  name: "Battering Ram",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  text: `${BEGIN_TEXT} ${REMINDER}\n${WALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "banding", duration: "until-end-of-combat" },
      resolve: null,
      text: BEGIN_TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self", blocker: { subtypes: ["Wall"] } },
      targets: [],
      effect: { kind: "delayed-trigger", at: "end-of-combat", effect: { kind: "destroy", target: "trigger-object" }, text: "Destroy that Wall." },
      resolve: null,
      text: WALL_TEXT,
    },
  ],
});
