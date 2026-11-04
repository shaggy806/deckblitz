/**
 * Mana and the chosen color: `spendOnly`'s `chosenColor` and a cost's
 * `spendOnlyChosenColor` (Throne of Eldraine), and a `tapped-for-mana` trigger's
 * `anyAbility` (Caged Sun): any ability of the land, tapped for or not, as a
 * triggered mana ability (rule 605.1b).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, activate, B, cast, enter, hand, lands, nextTurn, pickModes, pt, spawn, table, toHand, zone } from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string => game.state.players[player].manaPool.map((m) => m.type).sort().join("");

const chose = (game: Game, id: ObjectId, color: string): ObjectId => {
  game.state.objects[id].chosenOnEnter = color;
  return id;
};

const castable = (game: Game, id: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === id);

const activatable = (game: Game, id: ObjectId, index: number): boolean =>
  game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === id && a.abilityIndex === index);

describe("Throne of Eldraine: four mana for monocolored spells of the chosen color", () => {
  const throne = (game: Game): ObjectId => {
    const id = chose(game, spawn(game, "Throne of Eldraine"), "G");
    activate(game, id, 0);
    return id;
  };

  it("makes four of the chosen color", () => {
    const { game } = table();
    throne(game);
    expect(pool(game)).toBe("GGGG");
  });

  it("pays for a monocolored spell of that color, and leaves the rest", () => {
    const { game } = table();
    const bears = toHand(game, "Grizzly Bears");
    throne(game);
    expect(castable(game, bears)).toBe(true);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(pool(game)).toBe("GG");
  });

  it("doesn't pay for another color, a multicolored spell, a colorless one or an ability", () => {
    const { game } = table();
    const giant = toHand(game, "Hill Giant");
    const finks = toHand(game, "Kitchen Finks");
    const ring = toHand(game, "Sol Ring");
    const another = chose(game, spawn(game, "Throne of Eldraine"), "G");
    throne(game);
    expect(castable(game, giant)).toBe(false);
    expect(castable(game, finks)).toBe(false);
    expect(castable(game, ring)).toBe(false);
    // A second Throne's {3} is "of the chosen color", but this mana is for spells.
    expect(activatable(game, another, 1)).toBe(false);
  });

  it("with none chosen, no mana pays for its draw", () => {
    const { game } = table();
    const id = spawn(game, "Throne of Eldraine");
    lands(game, "Forest", 3);
    expect(activatable(game, id, 1)).toBe(false);
  });
});

describe("Throne of Eldraine: spend only mana of the chosen color to draw", () => {
  it("draws two, paid with that color", () => {
    const { game } = table();
    const id = chose(game, spawn(game, "Throne of Eldraine"), "G");
    lands(game, "Forest", 3);
    const before = hand(game).length;
    activate(game, id, 1);
    expect(hand(game)).toHaveLength(before + 2);
  });

  it("isn't paid with another color, or part of one", () => {
    const { game } = table();
    const id = chose(game, spawn(game, "Throne of Eldraine"), "G");
    lands(game, "Mountain", 3);
    expect(activatable(game, id, 1)).toBe(false);
    lands(game, "Forest", 2);
    expect(activatable(game, id, 1)).toBe(false);
    lands(game, "Forest", 1);
    expect(activatable(game, id, 1)).toBe(true);
  });

  it("a land of two colors pays as the chosen one", () => {
    const { game } = table();
    const id = chose(game, spawn(game, "Throne of Eldraine"), "G");
    lands(game, "Taiga", 3);
    expect(activatable(game, id, 1)).toBe(true);
    const before = hand(game).length;
    activate(game, id, 1);
    expect(hand(game)).toHaveLength(before + 2);
  });

  it("floating mana of the chosen color pays, another's doesn't", () => {
    const { game } = table();
    const id = chose(game, spawn(game, "Throne of Eldraine"), "G");
    const forests = lands(game, "Forest", 3);
    const mountains = lands(game, "Mountain", 1);
    activate(game, mountains[0], 0);
    for (const forest of forests) activate(game, forest, 0);
    expect(pool(game)).toBe("GGGR");
    const before = hand(game).length;
    activate(game, id, 1);
    expect(hand(game)).toHaveLength(before + 2);
    expect(pool(game)).toBe("R");
  });

  it("a generic cost elsewhere is unaffected", () => {
    const { game } = table();
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    lands(game, "Mountain", 1);
    chose(game, spawn(game, "Throne of Eldraine", A, { tapped: true }), "G");
    expect(castable(game, bears)).toBe(true);
  });
});

describe("Caged Sun: creatures of the chosen color", () => {
  it("gives your creatures of that color +1/+1 and nobody else's", () => {
    const { game } = table();
    chose(game, spawn(game, "Caged Sun"), "G");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Caged Sun: a land's ability causing you to add mana", () => {
  it("adds one more when a land is tapped for the chosen color, not another", () => {
    const { game } = table();
    chose(game, spawn(game, "Caged Sun"), "G");
    const [forest] = lands(game, "Forest", 1);
    const [mountain] = lands(game, "Mountain", 1);
    activate(game, forest, 0);
    expect(pool(game)).toBe("GG");
    activate(game, mountain, 0);
    expect(pool(game)).toBe("GGR");
  });

  it("adds one, however much the land made", () => {
    const { game } = table();
    chose(game, spawn(game, "Caged Sun"), "G");
    const [sanctuary] = lands(game, "Selesnya Sanctuary", 1);
    game.state.objects[sanctuary].tapped = false;
    activate(game, sanctuary, 0);
    expect(pool(game)).toBe("GGW");
  });

  it("nothing for a nonland source", () => {
    const { game } = table();
    chose(game, spawn(game, "Caged Sun"), "G");
    const elves = spawn(game, "Llanowar Elves");
    activate(game, elves, 0);
    expect(pool(game)).toBe("G");
  });

  it("nothing for another player's land", () => {
    const { game } = table();
    chose(game, spawn(game, "Caged Sun"), "G");
    const [forest] = lands(game, "Forest", 1, B);
    nextTurn(game);
    activate(game, forest, 0, { player: B });
    expect(pool(game, B)).toBe("G");
  });

  it("with no color chosen, never", () => {
    const { game } = table();
    spawn(game, "Caged Sun");
    const [forest] = lands(game, "Forest", 1);
    activate(game, forest, 0);
    expect(pool(game)).toBe("G");
  });

  it("counts toward what the land can pay for, as Gauntlet of Power's does", () => {
    const { game } = table();
    chose(game, spawn(game, "Caged Sun"), "G");
    const two = lands(game, "Forest", 2);
    const courser = toHand(game, "Centaur Courser"); // {2}{G}
    expect(castable(game, courser)).toBe(true);
    cast(game, courser);
    expect(zone(game, courser)).toBe("battlefield");
    expect(two.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(pool(game)).toBe("G");
  });

  it("works off a land's ability with no {T} (a storage land)", () => {
    const { game } = table();
    chose(game, spawn(game, "Caged Sun"), "W");
    const calciform = spawn(game, "Calciform Pools");
    game.state.objects[calciform].counters.storage = 2;
    lands(game, "Wastes", 1);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: calciform,
      abilityIndex: 2,
      targets: [],
      xValue: 2,
      manaColors: ["W", "U"],
    });
    expect(pool(game)).toBe("UWW");
  });

  it("works off a land's trigger on the stack (Crumbling Vestige)", () => {
    const { game, a } = table();
    chose(game, spawn(game, "Caged Sun"), "G");
    pickModes(a, 4);
    enter(game, "Crumbling Vestige");
    expect(pool(game)).toBe("GG");
  });

  it("a different color from that trigger gets nothing", () => {
    const { game, a } = table();
    chose(game, spawn(game, "Caged Sun"), "G");
    pickModes(a, 0);
    enter(game, "Crumbling Vestige");
    expect(pool(game)).toBe("W");
  });
});
