import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const BAT_TEXT = "When this token deals combat damage to a player, sacrifice it and return the exiled card to the battlefield tapped.";
const TRIGGER_TEXT = `Whenever another nontoken Vampire you control dies, you may pay {1} and exile it. If you do, create a 1/1 black Bat creature token with flying. It gains "${BAT_TEXT}"`;

export default defineCard({
  name: "Timothar, Baron of Bats",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 4,
  toughness: 4,
  text: `Ward—Discard a card.\n${TRIGGER_TEXT}`,
  triggered: [
    ward({ discard: 1 }),
    {
      trigger: {
        on: "dies",
        who: "you-control",
        otherOnly: true,
        filter: { type: "creature", subtype: "Vampire", token: false },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} and exile it to create a Bat token?",
        cost: "{1}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "create-token", token: "Bat Token", count: 1 },
                  {
                    kind: "link-exiled-to-created",
                    gains: [
                      {
                        trigger: { on: "deals-combat-damage-to-player", who: "self" },
                        targets: [],
                        effect: {
                          kind: "sequence",
                          effects: [
                            { kind: "sacrifice-source" },
                            // Under the controller of this ability (the
                            // ruling), the player whose Bat it was by then.
                            { kind: "return-exiled-by-source", linked: "battlefield", under: "you", enterTapped: true },
                          ],
                        },
                        resolve: null,
                        text: BAT_TEXT,
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
