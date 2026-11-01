import { defineCard } from "../define.js";

// The exiled card is linked to this stint (rule 607.2a); its card types are read
// off it for as long as it stays exiled (rule 702.16h).

const IMPRINT_TEXT = "Imprint — When this creature enters, you may exile target card from a graveyard.";
const TEXT =
  "This creature has protection from each of the exiled card's card types. (Artifact, battle, creature, enchantment, instant, kindred, land, planeswalker, and sorcery are card types.)";

export default defineCard({
  name: "Mirror Golem",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 4,
  text: `${IMPRINT_TEXT}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "may",
        prompt: "Exile target card from a graveyard?",
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: IMPRINT_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, protection: { exiledCardTypes: true }, text: TEXT }],
});
