import { defineCard } from "../define.js";

// "Is also a Cleric, Rogue, Warrior, and Wizard" is a CDA in every zone
// (`alsoSubtypes`) — so Burakos alone is a party of one, filling whichever
// role the rest leave open. X is counted once, as the attack trigger resolves.

const ATTACK_TEXT =
  "Whenever Burakos attacks, defending player loses X life and you create X Treasure tokens, where X is the number of creatures in your party.";

export default defineCard({
  name: "Burakos, Party Leader",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc"],
  alsoSubtypes: ["Cleric", "Rogue", "Warrior", "Wizard"],
  power: 2,
  toughness: 4,
  pairing: { kind: "choose-a-background" },
  text: `Burakos is also a Cleric, Rogue, Warrior, and Wizard.\n${ATTACK_TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-player", amount: { partySize: "you" } },
          { kind: "create-token", token: "Treasure Token", count: { partySize: "you" } },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
