import { defineCard } from "../define.js";

export default defineCard({
  name: "Kazuul, Tyrant of the Cliffs",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 5,
  toughness: 4,
  text: "Whenever a creature an opponent controls attacks, if you're the defending player, create a 3/3 red Ogre creature token unless that creature's controller pays {3}.",
  triggered: [
    {
      // `youDefend` is both halves of the wording at once: "if you're the
      // defending player" (attacked yourself, or a planeswalker you control,
      // or a battle you protect — rule 508.5), and "a creature an opponent
      // controls" — nobody can attack themselves, so an attacker aimed at you
      // is always an opponent's.
      trigger: { on: "attacks", who: "any", youDefend: true },
      targets: [],
      effect: {
        kind: "unless",
        // "that creature's controller" — the attacker, not a target.
        chooser: "trigger-controller",
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "create-token", token: "Ogre Token", count: 1 },
      },
      resolve: null,
      text: "Whenever a creature an opponent controls attacks, if you're the defending player, create a 3/3 red Ogre creature token unless that creature's controller pays {3}.",
    },
  ],
});
