import { defineCard } from "../define.js";

// Final Fantasy (FIN). EDHREC rank 8327.
//
// The mode is chosen as it's activated, with its own target (rule 700.2b).
// A card with {X} in its cost has mana value with X = 0 in the graveyard (the
// ruling), which the `manaValue` filter reads.
export default defineCard({
  name: "Phoenix Down",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  text: "{1}{W}, {T}, Exile this artifact: Choose one —\n• Return target creature card with mana value 4 or less from your graveyard to the battlefield tapped.\n• Exile target Skeleton, Spirit, or Zombie.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true, exileSelf: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Return target creature card with mana value 4 or less from your graveyard to the battlefield tapped.",
            targets: [
              {
                kind: "card-in-graveyard",
                whose: "you",
                filter: { type: "creature", manaValue: { op: "lte", n: 4 } },
              },
            ],
            effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
          },
          {
            text: "Exile target Skeleton, Spirit, or Zombie.",
            targets: [{ kind: "permanent", filter: { subtypes: ["Skeleton", "Spirit", "Zombie"] } }],
            effect: { kind: "exile", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "{1}{W}, {T}, Exile this artifact: Choose one —\n• Return target creature card with mana value 4 or less from your graveyard to the battlefield tapped.\n• Exile target Skeleton, Spirit, or Zombie.",
    },
  ],
});
