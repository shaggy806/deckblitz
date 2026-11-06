import { defineCard } from "../define.js";

const GRANT_TEXT =
  'Artifact creatures you control have "Whenever this creature deals combat damage to a player, create a 1/1 colorless Borg artifact creature token."';

export default defineCard({
  name: "Locutus of Borg",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "create-token", token: "Borg Token", count: 1 },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, create a 1/1 colorless Borg artifact creature token.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
