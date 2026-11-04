import { defineCard } from "../define.js";

// One exile, one shuffled pile: nobody but its controller knows which of the
// three is the creature (rule 708.5).
export default defineCard({
  name: "Become Anonymous",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Exile target nontoken creature you own and the top two cards of your library in a face-down pile, shuffle that pile, then cloak those cards. They enter tapped. (To cloak a card, put it onto the battlefield face down as a 2/2 creature with ward {2}. Turn it face up any time for its mana cost if it's a creature card.)",
  targets: [{ kind: "permanent", filter: { type: "creature", token: false, ownedBy: "you" } }],
  effect: { kind: "cloak-exiled-pile", libraryTop: 2, enterTapped: true },
});
