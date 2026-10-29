import { defineCard } from "../define.js";

const WELD_TEXT =
  "{T}: Choose target artifact a player controls and target artifact card in that player's graveyard. If both targets are still legal as this ability resolves, that player simultaneously sacrifices the artifact and returns the artifact card to the battlefield.";

export default defineCard({
  name: "Goblin Welder",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 1,
  toughness: 1,
  text: WELD_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        "artifact",
        // "In that player's graveyard": the card's owner is the artifact's controller.
        {
          kind: "other",
          of: { kind: "card-in-graveyard", filter: { type: "artifact" } },
          than: { slot: 0 },
          sameController: true,
        },
      ],
      // The ruling: either target illegal, nothing is sacrificed or returned.
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "target-legal", index: 0 },
            { kind: "target-legal", index: 1 },
          ],
        },
        then: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "sacrifice-target", target: 0, byItsController: true },
            // Its owner's graveyard, so under its owner's control: that player.
            { kind: "put-onto-battlefield", target: 1 },
          ],
        },
      },
      resolve: null,
      text: WELD_TEXT,
    },
  ],
});
