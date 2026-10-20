import { defineCard } from "../define.js";

/** The disturb back face of Distracting Geist, an Aura. Its "exile it
 * instead" is the face's own ability (`self`). The granted trigger targets
 * only a creature the player the enchanted creature attacks controls (the
 * ruling). */
const GRANT_TEXT =
  "Enchanted creature has \"Whenever this creature attacks, tap target creature defending player controls.\"";
const EXILE_TEXT = "If Clever Distraction would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Clever Distraction",
  art: "https://cards.scryfall.io/art_crop/back/a/7/a7fc0939-6286-44de-a727-c83bfd3fa752.jpg",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: ["creature-defending-player-controls"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: "Whenever this creature attacks, tap target creature defending player controls.",
        },
      ],
      text: GRANT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Distracting Geist", "Clever Distraction"],
  transform: true,
  disturb: { cost: "{4}{W}" },
});
