/**
 * B338, the costs-mana lane (second agent): Voltage Surge's optional
 * sacrifice as an additional cost (rule 118.8 — not kicker); Vine Gecko's
 * first kicked spell each turn (702.33d) and Bite Down on Crime's discount
 * if evidence was collected; Close Encounter's warped card in exile chosen
 * as a cost (702.185b); Rhystic Cave's mana ability "unless any player pays
 * {1}" (605.1a, 605.3b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  cast,
  counters,
  lands,
  life,
  nextTurn,
  pickFromZone,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).flatMap((l) => (l.kind === "cast-spell" && l.card === card ? [l] : []));

describe("Voltage Surge", () => {
  it("the sacrifice is offered only with an artifact, and isn't a kicked spell", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Hill Giant", B);
    const surge = game.debugSpawn("Voltage Surge", A, "hand");
    expect(offers(game, surge).map((o) => o.kicked === true)).toEqual([false]);
    spawn(game, "Ornithopter");
    const paid = offers(game, surge).find((o) => o.kicked === true);
    expect(paid?.kickerKeyword).toBe("additional cost");
  });

  it("deals 2 unpaid, 4 with an artifact sacrificed", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B); // 3/3
    const thopter = spawn(game, "Ornithopter");
    cast(game, game.debugSpawn("Voltage Surge", A, "hand"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, thopter)).toBe("battlefield");
    const other = spawn(game, "Hill Giant", B);
    cast(game, game.debugSpawn("Voltage Surge", A, "hand"), { targets: [ref(other)], kicked: true });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, other)).toBe("graveyard");
  });
});

describe("Vine Gecko", () => {
  it("the first kicked spell each turn costs {1} less, and each kicked spell grows it", () => {
    const { game } = table();
    const gecko = spawn(game, "Vine Gecko");
    // Burst Lightning kicked is {R} + {4}: four lands with the Gecko.
    lands(game, "Mountain", 4);
    cast(game, game.debugSpawn("Burst Lightning", A, "hand"), { targets: [ref(B)], kicked: true });
    expect(life(game, B)).toBe(16);
    expect(counters(game, gecko, "+1/+1")).toBe(1);
    // The second kicked spell this turn pays in full.
    lands(game, "Mountain", 4);
    const second = game.debugSpawn("Burst Lightning", A, "hand");
    expect(() => cast(game, second, { targets: [ref(B)], kicked: true })).toThrow();
    lands(game, "Mountain", 1);
    cast(game, second, { targets: [ref(B)], kicked: true });
    expect(life(game, B)).toBe(12);
    expect(counters(game, gecko, "+1/+1")).toBe(2);
  });

  it("an unkicked spell neither uses it up nor is reduced", () => {
    const { game } = table();
    const gecko = spawn(game, "Vine Gecko");
    lands(game, "Mountain", 1);
    cast(game, game.debugSpawn("Burst Lightning", A, "hand"), { targets: [ref(B)] });
    expect(counters(game, gecko, "+1/+1")).toBe(0);
    lands(game, "Mountain", 4);
    cast(game, game.debugSpawn("Burst Lightning", A, "hand"), { targets: [ref(B)], kicked: true });
    expect(life(game, B)).toBe(14);
  });

  it("a bargained spell isn't a kicked one: no reduction, and it doesn't use it up", () => {
    const { game } = table();
    spawn(game, "Vine Gecko");
    // Candy Grapple is {1}{B}, bargain: two Swamps still needed.
    const target = spawn(game, "Grizzly Bears", B);
    const clue = spawn(game, "Clue Token");
    game.state.objects[clue].isToken = true;
    lands(game, "Swamp", 1);
    const grapple = game.debugSpawn("Candy Grapple", A, "hand");
    expect(() => cast(game, grapple, { targets: [ref(target)], kicked: true })).toThrow();
    lands(game, "Swamp", 1);
    cast(game, grapple, { targets: [ref(target)], kicked: true });
    lands(game, "Mountain", 4);
    cast(game, game.debugSpawn("Burst Lightning", A, "hand"), { targets: [ref(B)], kicked: true });
    expect(life(game, B)).toBe(16);
  });
});

describe("Close Encounter", () => {
  /** Bygone Colossus (9/9) warped for {3}, exiled at the end step: a warped
   * card in Alice's exile, back on her turn. */
  function warpedColossus(game: Game): ObjectId {
    lands(game, "Wastes", 3);
    const colossus = toHand(game, "Bygone Colossus");
    cast(game, colossus, { via: "warp" });
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, colossus)).toBe("exile");
    expect(game.state.objects[colossus].warped).toBe(true);
    return colossus;
  }

  it("isn't castable with no creature to choose; a card exiled otherwise isn't warped", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const target = spawn(game, "Grizzly Bears", B);
    const exiled = game.debugSpawn("Bygone Colossus", A, "exile");
    const encounter = toHand(game, "Close Encounter");
    expect(game.state.objects[exiled].warped).toBeUndefined();
    expect(() => cast(game, encounter, { targets: [ref(target)] })).toThrow();
  });

  it("deals damage equal to a warped card's power, chosen from exile", () => {
    const { game, a } = table();
    const colossus = warpedColossus(game);
    lands(game, "Forest", 2);
    const bear = spawn(game, "Grizzly Bears");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B); // 6/6
    const seen = pickFromZone(a, colossus);
    cast(game, toHand(game, "Close Encounter"), { targets: [ref(dreadmaw)] });
    expect(seen.offered).toEqual(expect.arrayContaining([colossus, bear]));
    expect(zone(game, dreadmaw)).toBe("graveyard");
    // Chosen, not moved: still warped in exile.
    expect(zone(game, colossus)).toBe("exile");
  });

  it("or a creature you control's power", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const giant = spawn(game, "Hill Giant"); // 3/3
    const target = spawn(game, "Hill Giant", B);
    pickFromZone(a, giant);
    cast(game, toHand(game, "Close Encounter"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
  });
});

describe("Rhystic Cave", () => {
  const tapCave = (game: Game, cave: ObjectId, color: ManaType): void => {
    game.dispatch({ type: "activate-ability", player: A, source: cave, abilityIndex: 0, targets: [], manaColors: [color] });
  };
  const pool = (game: Game, player: PlayerId): readonly ManaType[] => game.state.players[player].manaPool.map((u) => u.type);
  const asked = (game: Game): PlayerId | undefined =>
    game.state.awaiting?.kind === "choose-modes" ? game.state.awaiting.player : undefined;

  it("a mana ability: each player who could pay {1} is asked in turn order, off the stack", () => {
    const { game } = table({ players: 3 });
    const cave = spawn(game, "Rhystic Cave");
    lands(game, "Island", 1);
    lands(game, "Swamp", 1, B);
    lands(game, "Plains", 1, C);
    tapCave(game, cave, "R");
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.objects[cave].tapped).toBe(true);
    // Alice first (the active player), then Bob, then Carol.
    expect(asked(game)).toBe(A);
    expect(game.legalActions(B)).toEqual([]);
    game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    expect(asked(game)).toBe(B);
    game.dispatch({ type: "choose-modes", player: B, modes: [0] });
    expect(asked(game)).toBe(C);
    game.dispatch({ type: "choose-modes", player: C, modes: [0] });
    expect(game.state.awaiting).toBeNull();
    expect(pool(game, A)).toEqual(["R"]);
    expect(game.state.priority.holder).toBe(A);
  });

  it("one who pays {1}: no mana, and nobody after them is asked; the cave wasn't tapped for mana", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Mana Reflection");
    const cave = spawn(game, "Rhystic Cave");
    const swamp = lands(game, "Swamp", 1, B)[0];
    lands(game, "Plains", 1, C);
    // Alice can't pay: she isn't asked.
    tapCave(game, cave, "G");
    expect(asked(game)).toBe(B);
    game.dispatch({ type: "choose-modes", player: B, modes: [1] });
    expect(game.state.objects[swamp].tapped).toBe(true);
    expect(game.state.awaiting).toBeNull();
    expect(pool(game, A)).toEqual([]);
    expect(game.state.priority.holder).toBe(A);
  });

  it("nobody able to pay: the mana at once, doubled by a tap-for-mana doubler", () => {
    const { game } = table();
    spawn(game, "Mana Reflection");
    const cave = spawn(game, "Rhystic Cave");
    tapCave(game, cave, "U");
    expect(game.state.awaiting).toBeNull();
    expect(pool(game, A)).toEqual(["U", "U"]);
  });

  it("isn't a source the auto-payer taps", () => {
    const { game } = table();
    spawn(game, "Rhystic Cave");
    const bear = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    expect(() => cast(game, bear)).toThrow();
  });
});

describe("Bite Down on Crime", () => {
  it("costs {2} less with evidence collected, and the pumped creature bites", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bear = spawn(game, "Grizzly Bears"); // 2/2, +2/+0 makes 4
    const giant = spawn(game, "Hill Giant", B); // 3/3
    const bite = game.debugSpawn("Bite Down on Crime", A, "hand");
    expect(() => cast(game, bite, { targets: [ref(bear), ref(giant)] })).toThrow();
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw"); // mana value 6
    pickFromZone(a, dreadmaw);
    cast(game, bite, { targets: [ref(bear), ref(giant)], kicked: true });
    expect(zone(game, dreadmaw)).toBe("exile");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bear)).toBe("battlefield");
  });
});
