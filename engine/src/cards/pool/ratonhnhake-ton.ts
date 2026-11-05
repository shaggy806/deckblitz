import { defineCard } from "../define.js";

const HIDDEN = "As long as Ratonhnhaké꞉ton hasn't dealt damage yet, it has hexproof and can't be blocked.";
const HIT =
  "Whenever Ratonhnhaké꞉ton deals combat damage to a player, create a 1/1 black Assassin creature token with menace. When you do, return target Equipment card from your graveyard to the battlefield, then attach it to that token.";

// The Equipment is targeted only once the token exists (a reflexive ability,
// its ruling), and one that can't be attached to it stays unattached.
export default defineCard({
  name: "Ratonhnhaké꞉ton",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 3,
  text: `${HIDDEN}\n${HIT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-hasnt-dealt-damage" },
      grantKeywords: ["hexproof"],
      restrictions: ["cant-be-blocked"],
      text: HIDDEN,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Assassin Token (Aya of Alexandria)", count: 1 },
          {
            kind: "reflexive-trigger",
            about: "created",
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Equipment" } }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "put-onto-battlefield", target: 0 },
                { kind: "attach", target: "trigger-object", attachment: "put-this-way" },
              ],
            },
            text: "When you do, return target Equipment card from your graveyard to the battlefield, then attach it to that token.",
          },
        ],
      },
      resolve: null,
      text: HIT,
    },
  ],
});
