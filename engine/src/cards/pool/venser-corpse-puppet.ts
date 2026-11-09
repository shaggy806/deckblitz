import { defineCard } from "../define.js";

const TEXT =
  "Whenever you proliferate, choose one —\n• If you don't control a creature named The Hollow Sentinel, create The Hollow Sentinel, a legendary 3/3 colorless Phyrexian Golem artifact creature token.\n• Target artifact creature you control gains flying and lifelink until end of turn.";

// EDHREC rank 12544.
export default defineCard({
  name: "Venser, Corpse Puppet",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["lifelink"],
  toxic: 1,
  text: `Lifelink, toxic 1\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "proliferates", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "If you don't control a creature named The Hollow Sentinel, create The Hollow Sentinel, a legendary 3/3 colorless Phyrexian Golem artifact creature token.",
            effect: {
              kind: "conditional",
              condition: { kind: "not", of: { kind: "controls", filter: { type: "creature", hasName: "The Hollow Sentinel" }, atLeast: 1 } },
              then: { kind: "create-token", token: "The Hollow Sentinel Token", count: 1 },
            },
          },
          {
            text: "Target artifact creature you control gains flying and lifelink until end of turn.",
            targets: [{ kind: "permanent", whose: "you", filter: { types: ["artifact", "creature"] } }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
