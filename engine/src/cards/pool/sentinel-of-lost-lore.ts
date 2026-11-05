import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, choose one or more —";
const OWN = "Return target card you own in exile that has an Adventure to your hand.";
const THEIRS = "Put target card you don't own in exile that has an Adventure on the bottom of its owner's library.";
const GRAVEYARD = "Exile target player's graveyard.";

export default defineCard({
  name: "Sentinel of Lost Lore",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 3,
  toughness: 4,
  text: `${ENTERS}\n• ${OWN}\n• ${THEIRS}\n• ${GRAVEYARD}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 3,
        modes: [
          {
            text: OWN,
            targets: [{ kind: "card-in-exile", whose: "you", filter: { hasAdventure: true } }],
            effect: { kind: "return-to-hand", target: 0, from: "exile" },
          },
          {
            text: THEIRS,
            targets: [{ kind: "card-in-exile", whose: "opponent", filter: { hasAdventure: true } }],
            effect: { kind: "put-on-library", target: 0, position: "bottom" },
          },
          {
            text: GRAVEYARD,
            targets: ["player"],
            effect: { kind: "exile-graveyard", target: 0 },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
