import { defineCard } from "../define.js";

// EDHREC rank 3999. One "becomes" (rule 613.1): it keeps its card types and
// legendary, gains the Equipment subtype, and loses every other ability; what
// this same patch gives it, it has (613.7). It lasts indefinitely (the ruling).
const BECOME_TEXT = `Whenever a legendary creature you control enters, you may have The Irencrag become a legendary Equipment artifact named Everflame, Heroes' Legacy. If you do, it gains equip {3} and "Equipped creature gets +3/+3" and loses all other abilities.`;

export default defineCard({
  name: "The Irencrag",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `{T}: Add {C}.\n${BECOME_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", supertype: "legendary" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have The Irencrag become Everflame, Heroes' Legacy?",
        effect: {
          kind: "become",
          target: "source",
          duration: "permanent",
          name: "Everflame, Heroes' Legacy",
          addSubtypes: ["Equipment"],
          loseAbilities: true,
          activated: [
            {
              cost: { mana: "{3}", tap: false },
              targets: ["creature-you-control"],
              effect: { kind: "attach", target: 0 },
              resolve: null,
              text: "Equip {3}",
              sorcerySpeed: true,
            },
          ],
          static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Equipped creature gets +3/+3." }],
        },
      },
      resolve: null,
      text: BECOME_TEXT,
    },
  ],
});
