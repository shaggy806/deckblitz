import { defineCard } from "../define.js";

// EDHREC rank 7540.
// Makes Skeleton → use "Skeleton Token (Gut, True Soul Zealot)".

export default defineCard({
  name: "Altar of Bhaal",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: "{2}{B}, {T}, Exile a creature you control: Return target creature card from your graveyard to the battlefield. Activate only as a sorcery.",
  activated: [
    {
      cost: {
        mana: "{2}{B}",
        tap: true,
        sacrifice: { filter: { type: "creature", controlledBy: "you" } },
        exilesSacrifice: true,
      },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: "{2}{B}, {T}, Exile a creature you control: Return target creature card from your graveyard to the battlefield. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Altar of Bhaal", "Bone Offering"],
  adventure: true,
});
