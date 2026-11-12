import { defineCard } from "../define.js";

// EDHREC rank 10304. Front face of a transforming double-faced card.

const ENTER_TEXT = "When Casal enters, search your library for a Forest card, put it onto the battlefield tapped, then shuffle.";
const ATTACK_TEXT = "Whenever Casal attacks, you may pay {1}{G}. If you do, transform her.";

export default defineCard({
  name: "Casal, Lurkwood Pathfinder",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Tiefling", "Druid"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Forest" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{G} to transform Casal?",
        cost: "{1}{G}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Casal, Lurkwood Pathfinder", "Casal, Pathbreaker Owlbear"],
  transform: true,
});
