/**
 * `{ playerCounters, forTarget }`, a target player's counters as an amount, and
 * the card it was built for. Vraska, Betrayal's Sting's −9, "if target player
 * has fewer than nine poison counters, they get a number of poison counters
 * equal to the difference", and the rest of her text: compleated, the 0, and the
 * −2's "becomes a Treasure artifact with … and loses all other card types and
 * abilities" (rule 205.1a; her rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { abilityPolarities } from "../target-polarity.js";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  grant,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  ref,
  registryOf,
  spawn,
  subtypes,
  supertypes,
  table,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

const VRASKA = "Vraska, Betrayal's Sting";

const poison = (game: Game, player = B): number => game.state.players[player].counters.poison ?? 0;

const activatable = (game: Game, id: ObjectId): string[] => [
  ...new Set(
    game
      .legalActions(A)
      .flatMap((action) =>
        action.kind === "activate-ability" && action.source === id ? [action.text.replace(/ \(add \{.\}\)$/, "")] : [],
      ),
  ),
];

describe("Vraska, Betrayal's Sting: compleated", () => {
  it("all mana: six loyalty, and her mana value is 6 either way", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const vraska = toHand(game, VRASKA);
    cast(game, vraska);
    expect(counters(game, vraska, "loyalty")).toBe(6);
    expect(life(game, A)).toBe(20);
  });

  it("{B/P} paid with 2 life: two fewer", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const vraska = toHand(game, VRASKA);
    cast(game, vraska);
    expect(life(game, A)).toBe(18);
    expect(counters(game, vraska, "loyalty")).toBe(4);
  });
});

describe("Vraska, Betrayal's Sting: 0", () => {
  it("you draw, lose 1 life and proliferate", () => {
    const { game, a } = table();
    game.state.players[B].counters.poison = 1;
    const vraska = spawn(game, VRASKA);
    const drawn = toLibrary(game, "Forest");
    a.chooseProliferateFn = (_view, eligible) => eligible;
    loyalty(game, vraska, 0);
    expect(hand(game)).toContain(drawn);
    expect(life(game, A)).toBe(19);
    expect(poison(game)).toBe(2);
    expect(counters(game, vraska, "loyalty")).toBe(7);
  });
});

describe("Vraska, Betrayal's Sting: −2", () => {
  it("only a Treasure artifact, its supertypes and colour kept (her ruling), with only the mana ability", () => {
    const { game } = table();
    const thalia = spawn(game, "Thalia, Guardian of Thraben", B);
    loyalty(game, spawn(game, VRASKA), -2, { targets: [ref(thalia)] });
    expect(types(game, thalia)).toEqual(["artifact"]);
    expect(subtypes(game, thalia)).toEqual(["Treasure"]);
    expect(supertypes(game, thalia)).toContain("legendary");
    expect(game.state.objects[thalia].controller).toBe(B);
    expect([...keywords(game, thalia)]).not.toContain("first-strike");
    // Her static is gone: Giant Growth is back to {G}.
    lands(game, "Forest", 1);
    const growth = toHand(game, "Giant Growth");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, growth, { targets: [ref(bears)] });
    expect(zone(game, growth)).toBe("graveyard");
  });

  it("it stays that way across turns, and its land types go with its land type", () => {
    const { game } = table();
    const arbor = spawn(game, "Dryad Arbor", B);
    loyalty(game, spawn(game, VRASKA), -2, { targets: [ref(arbor)] });
    expect(types(game, arbor)).toEqual(["artifact"]);
    expect(subtypes(game, arbor)).toEqual(["Treasure"]);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(types(game, arbor)).toEqual(["artifact"]);
    expect(subtypes(game, arbor)).toEqual(["Treasure"]);
  });

  it("the mana ability is usable at once, even summoning sick, by whoever controls it", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves", A, { sick: true });
    loyalty(game, spawn(game, VRASKA), -2, { targets: [ref(elves)] });
    expect(activatable(game, elves)).toEqual(["{T}, Sacrifice this artifact: Add one mana of any color."]);
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === elves);
    if (offer === undefined || offer.kind !== "activate-ability") throw new Error("no mana ability offered");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: elves,
      abilityIndex: offer.abilityIndex,
      targets: [],
      manaColors: ["R"],
    });
    expect(zone(game, elves)).toBe("graveyard");
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["R"]);
  });

  it("an ability granted before it goes too; Equipment falls off", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    lands(game, "Forest", 1);
    activate(game, splitter, 0, { targets: [ref(bears)] });
    expect(game.state.objects[splitter].attachedTo).toBe(bears);
    grant(game, bears, "flying");
    loyalty(game, spawn(game, VRASKA), -2, { targets: [ref(bears)] });
    expect([...keywords(game, bears)]).toEqual([]);
    expect(game.state.objects[splitter].attachedTo).toBeNull();
    expect(types(game, bears)).toEqual(["artifact"]);
  });

  it("the bots read it as harm to the creature", () => {
    const { game } = table();
    const abilities = registryOf(game).get(VRASKA).activated;
    expect(abilityPolarities(abilities[1])).toEqual(["harm"]);
    expect(abilityPolarities(abilities[2])).toEqual(["harm"]);
  });
});

describe("Vraska, Betrayal's Sting: −9", () => {
  const minusNine = (game: Game, player = B): void => {
    loyalty(game, spawn(game, VRASKA), -9, { targets: [ref(player)], atLeast: 9 });
  };

  it("brings a player from none to nine", () => {
    const { game } = table();
    minusNine(game);
    expect(poison(game)).toBe(9);
  });

  it("reads the target's counters, not yours: from three, six more", () => {
    const { game } = table();
    game.state.players[A].counters.poison = 8;
    game.state.players[B].counters.poison = 3;
    minusNine(game);
    expect(poison(game)).toBe(9);
    expect(poison(game, A)).toBe(8);
  });

  it("with nine or more already, none", () => {
    const { game } = table();
    game.state.players[B].counters.poison = 9;
    minusNine(game);
    expect(poison(game)).toBe(9);
  });

  it("in a four-player game, only the one targeted", () => {
    const { game } = table({ players: 4 });
    game.state.players[C].counters.poison = 2;
    minusNine(game, C);
    expect(poison(game, C)).toBe(9);
    expect(poison(game, B)).toBe(0);
  });

  it("she pays nine loyalty for it, and goes with no counters left", () => {
    const { game } = table();
    const vraska = spawn(game, VRASKA);
    loyalty(game, vraska, -9, { targets: [ref(B)], atLeast: 9 });
    expect(zone(game, vraska)).toBe("graveyard");
  });
});
