/**
 * Changing the targets of a spell or ability on the stack (rule 115.7): the
 * `change-targets` effect and the `stack` target spec — Bolt Bend, Redirect
 * Lightning, Deflecting Swat, Imp's Mischief, Return the Favor, Untimely
 * Malfunction, Spellskite, Wild Ricochet, Hydroelectric Specimen.
 */

import { describe, expect, it } from "vitest";

import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import type { TargetRef } from "../target.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const C = asPlayerId("carol");

const objectRef = (object: ObjectId): TargetRef => ({ kind: "object", object });
const playerRef = (player: PlayerId): TargetRef => ({ kind: "player", player });

const quiet = (s: GameState): boolean =>
  s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;
/** Stop at a decision, or once everything has resolved. */
const settled = (s: GameState): boolean => s.awaiting !== null || quiet(s);

const setUp = (players: readonly PlayerId[] = [A, B]) => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: 20 },
    decks: players.map((player) => ({ player, cards: Array<string>(40).fill("Island") })),
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  for (const player of players) {
    for (const [land, n] of [["Mountain", 8], ["Swamp", 4], ["Island", 4]] as const) {
      for (let i = 0; i < n; i += 1) game.debugSpawn(land, player, "battlefield", { tapped: false });
    }
  }
  return game;
};

const castBy = (game: Game, player: PlayerId, name: string, targets: TargetRef[] = [], extra = {}): ObjectId => {
  const card = game.debugSpawn(name, player, "hand");
  const why = game.canDispatch({ type: "cast-spell", player, card, targets, ...extra });
  if (why !== null) throw new Error(`can't cast ${name}: ${why}`);
  game.dispatch({ type: "cast-spell", player, card, targets, ...extra });
  return card;
};

/** The holder passes until `player` has priority (with the stack as it is). */
const passTo = (game: Game, player: PlayerId): void => {
  for (let i = 0; i < 8 && game.state.priority.holder !== player; i += 1) {
    const holder = game.state.priority.holder;
    if (holder === null) break;
    game.dispatch({ type: "pass-priority", player: holder });
  }
};

/** Everyone passes until the top of the stack has resolved or a decision is up. */
const resolveTop = (game: Game): void => {
  const depth = game.state.zones.shared.stack.length;
  for (let i = 0; i < 12; i += 1) {
    if (game.state.awaiting !== null || game.state.zones.shared.stack.length < depth) return;
    const holder = game.state.priority.holder;
    if (holder === null) return;
    game.dispatch({ type: "pass-priority", player: holder });
  }
};

const targetsOf = (game: Game, id: ObjectId): readonly (TargetRef | undefined)[] => game.state.objects[id].targets ?? [];
const life = (game: Game, player: PlayerId): number => game.state.players[player].life;

describe("change the target of target spell or ability with a single target (rule 115.7a)", () => {
  it("asks for another legal target, and the spell resolves at it", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const theirs = game.debugSpawn("Grizzly Bears", A, "battlefield");
    const bolt = castBy(game, A, "Lightning Bolt", [objectRef(mine)]);
    passTo(game, B);
    castBy(game, B, "Redirect Lightning", [objectRef(bolt)], { costOption: 1 });
    resolveTop(game);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    expect(awaiting.player).toBe(B);
    expect(awaiting.prompt).toBe("Change the target of Lightning Bolt");
    // It must change: its own target isn't one of the choices.
    expect(awaiting.options[0]).not.toContainEqual(objectRef(mine));
    expect(awaiting.options[0]).toContainEqual(objectRef(theirs));
    expect(awaiting.options[0]).toContainEqual(playerRef(A));
    game.dispatch({ type: "choose-targets", player: B, targets: [objectRef(theirs)] });
    expect(targetsOf(game, bolt)).toEqual([objectRef(theirs)]);
    game.advanceUntil(quiet);
    expect(game.state.objects[mine].zone).toBe("battlefield");
    expect(game.state.objects[theirs].zone).toBe("graveyard");
  });

  it("changes it at once when there's exactly one other legal target", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const theirs = game.debugSpawn("Grizzly Bears", A, "battlefield");
    // Murder: creatures only — the one other creature is the only choice.
    const murder = castBy(game, A, "Murder", [objectRef(mine)]);
    passTo(game, B);
    castBy(game, B, "Bolt Bend", [objectRef(murder)]);
    resolveTop(game);
    expect(game.state.awaiting).toBeNull();
    expect(targetsOf(game, murder)).toEqual([objectRef(theirs)]);
  });

  it("leaves it unchanged when there's no other legal target", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const murder = castBy(game, A, "Murder", [objectRef(mine)]);
    passTo(game, B);
    castBy(game, B, "Bolt Bend", [objectRef(murder)]);
    resolveTop(game);
    expect(game.state.awaiting).toBeNull();
    expect(targetsOf(game, murder)).toEqual([objectRef(mine)]);
  });

  it("can't target a spell with two targets", () => {
    const game = setUp();
    const bears = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const bolt = castBy(game, A, "Electrolyze", [objectRef(bears), playerRef(B)], { division: [1, 1] });
    passTo(game, B);
    const card = game.debugSpawn("Bolt Bend", B, "hand");
    expect(game.canDispatch({ type: "cast-spell", player: B, card, targets: [objectRef(bolt)] })).not.toBeNull();
  });

  it("judges the new target as the spell's controller would choose it", () => {
    const game = setUp([A, B, C]);
    const bobs = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const carols = game.debugSpawn("Grizzly Bears", C, "battlefield");
    const alices = game.debugSpawn("Grizzly Bears", A, "battlefield");
    // "Target creature you don't control" — Alice's spell, so never Alice's.
    const zap = castBy(game, A, "Electrickery", [objectRef(bobs)]);
    passTo(game, B);
    castBy(game, B, "Bolt Bend", [objectRef(zap)]);
    resolveTop(game);
    // Carol's Bears is the one other legal target: changed at once.
    expect(game.state.awaiting).toBeNull();
    expect(targetsOf(game, zap)).toEqual([objectRef(carols)]);
    expect(targetsOf(game, zap)).not.toContainEqual(objectRef(alices));
  });

  it("announces the new target, so 'becomes the target' sees it", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const theirs = game.debugSpawn("Grizzly Bears", A, "battlefield");
    const murder = castBy(game, A, "Murder", [objectRef(mine)]);
    passTo(game, B);
    const before = game.events.filter((e) => e.type === "object-targeted" && e.object === theirs).length;
    castBy(game, B, "Bolt Bend", [objectRef(murder)]);
    resolveTop(game);
    expect(targetsOf(game, murder)).toEqual([objectRef(theirs)]);
    const after = game.events.filter((e) => e.type === "object-targeted" && e.object === theirs);
    expect(after.length - before).toBe(1);
    expect(after.at(-1)).toMatchObject({ by: A, source: murder, bySpell: true });
  });

  it("changes an ability's target too", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const theirs = game.debugSpawn("Grizzly Bears", A, "battlefield");
    // Prodigal Pyromancer: "{T}: deals 1 damage to any target".
    const pinger = game.debugSpawn("Prodigal Pyromancer", A, "battlefield", { summoningSick: false });
    game.dispatch({ type: "activate-ability", player: A, source: pinger, abilityIndex: 0, targets: [objectRef(mine)] });
    const ability = game.state.zones.shared.stack.at(-1) as ObjectId;
    passTo(game, B);
    castBy(game, B, "Redirect Lightning", [objectRef(ability)], { costOption: 0 });
    resolveTop(game);
    if (game.state.awaiting?.kind === "choose-targets") {
      game.dispatch({ type: "choose-targets", player: B, targets: [objectRef(theirs)] });
    }
    expect(targetsOf(game, ability)).not.toContainEqual(objectRef(mine));
    expect(life(game, B)).toBe(15);
  });
});

describe("you may choose new targets (rule 115.7d)", () => {
  it("keeps a target or changes it, and a divided spell keeps its division", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const theirs = game.debugSpawn("Grizzly Bears", A, "battlefield");
    const zap = castBy(game, A, "Electrolyze", [objectRef(mine), playerRef(B)], { division: [1, 1] });
    passTo(game, B);
    castBy(game, B, "Deflecting Swat", [objectRef(zap)]);
    resolveTop(game);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    expect(awaiting.current).toEqual([objectRef(mine), playerRef(B)]);
    // Each slot may keep what it has.
    expect(awaiting.options[0][0]).toEqual(objectRef(mine));
    game.dispatch({ type: "choose-targets", player: B, targets: [objectRef(theirs), playerRef(A)] });
    expect(targetsOf(game, zap)).toEqual([objectRef(theirs), playerRef(A)]);
    expect(game.state.objects[zap].division).toEqual([1, 1]);
  });
});

describe("Imp's Mischief", () => {
  it("loses life equal to the spell's mana value", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    game.debugSpawn("Grizzly Bears", A, "battlefield");
    const murder = castBy(game, A, "Murder", [objectRef(mine)]);
    passTo(game, B);
    castBy(game, B, "Imp's Mischief", [objectRef(murder)]);
    resolveTop(game);
    expect(life(game, B)).toBe(17);
  });

  it("can't target an ability", () => {
    const game = setUp();
    const pinger = game.debugSpawn("Prodigal Pyromancer", A, "battlefield", { summoningSick: false });
    game.dispatch({ type: "activate-ability", player: A, source: pinger, abilityIndex: 0, targets: [playerRef(B)] });
    const ability = game.state.zones.shared.stack.at(-1) as ObjectId;
    passTo(game, B);
    const card = game.debugSpawn("Imp's Mischief", B, "hand");
    expect(game.canDispatch({ type: "cast-spell", player: B, card, targets: [objectRef(ability)] })).not.toBeNull();
  });
});

describe("Spellskite — change a target to this creature (rule 115.7b)", () => {
  it("becomes the target of a spell that could target it", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const skite = game.debugSpawn("Spellskite", B, "battlefield", { summoningSick: false });
    const murder = castBy(game, A, "Murder", [objectRef(mine)]);
    passTo(game, B);
    game.dispatch({ type: "activate-ability", player: B, source: skite, abilityIndex: 0, targets: [objectRef(murder)] });
    resolveTop(game);
    expect(game.state.awaiting).toBeNull();
    expect(targetsOf(game, murder)).toEqual([objectRef(skite)]);
  });

  it("does nothing to a spell that couldn't target it", () => {
    const game = setUp();
    const skite = game.debugSpawn("Spellskite", B, "battlefield", { summoningSick: false });
    // "Target player discards two cards" — Spellskite isn't a player.
    const rot = castBy(game, A, "Mind Rot", [playerRef(B)]);
    passTo(game, B);
    game.dispatch({ type: "activate-ability", player: B, source: skite, abilityIndex: 0, targets: [objectRef(rot)] });
    resolveTop(game);
    expect(game.state.awaiting).toBeNull();
    expect(targetsOf(game, rot)).toEqual([playerRef(B)]);
  });
});

describe("Wild Ricochet", () => {
  it("changes the spell's targets, then copies it with its own", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const theirs = game.debugSpawn("Grizzly Bears", A, "battlefield");
    const bolt = castBy(game, A, "Lightning Bolt", [objectRef(mine)]);
    passTo(game, B);
    castBy(game, B, "Wild Ricochet", [objectRef(bolt)]);
    resolveTop(game);
    // First the spell's new targets.
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    game.dispatch({ type: "choose-targets", player: B, targets: [objectRef(theirs)] });
    expect(targetsOf(game, bolt)).toEqual([objectRef(theirs)]);
    // Then the copy's.
    game.advanceUntil(settled);
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    game.dispatch({ type: "choose-targets", player: B, targets: [playerRef(A)] });
    game.advanceUntil(quiet);
    expect(game.state.objects[theirs].zone).toBe("graveyard");
    expect(game.state.objects[mine].zone).toBe("battlefield");
    expect(life(game, A)).toBe(17);
  });
});

describe("Return the Favor", () => {
  it("copies an ability with its first mode", () => {
    const game = setUp();
    const pinger = game.debugSpawn("Prodigal Pyromancer", A, "battlefield", { summoningSick: false });
    game.dispatch({ type: "activate-ability", player: A, source: pinger, abilityIndex: 0, targets: [playerRef(B)] });
    const ability = game.state.zones.shared.stack.at(-1) as ObjectId;
    passTo(game, B);
    castBy(game, B, "Return the Favor", [objectRef(ability)], { modes: [0] });
    resolveTop(game);
    if (game.state.awaiting?.kind === "choose-targets") {
      game.dispatch({ type: "choose-targets", player: B, targets: [playerRef(A)] });
    }
    game.advanceUntil(quiet);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Hydroelectric Specimen", () => {
  it("may take a spell's single target for itself", () => {
    const game = setUp();
    const mine = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const bolt = castBy(game, A, "Lightning Bolt", [objectRef(mine)]);
    passTo(game, B);
    const specimen = castBy(game, B, "Hydroelectric Specimen");
    resolveTop(game);
    // Its trigger, aimed at the Bolt.
    game.advanceUntil((s) => s.awaiting !== null || s.zones.shared.stack.length > 1);
    if (game.state.awaiting?.kind === "choose-targets" && game.state.awaiting.prompt === undefined) {
      game.dispatch({ type: "choose-targets", player: B, targets: [objectRef(bolt)] });
    }
    resolveTop(game);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    expect(awaiting.options[0]).toEqual([objectRef(mine), objectRef(specimen)]);
    game.dispatch({ type: "choose-targets", player: B, targets: [objectRef(specimen)] });
    expect(targetsOf(game, bolt)).toEqual([objectRef(specimen)]);
  });
});

describe("a new target is judged from the spell, with what its filter reads", () => {
  it("Misdirection moves Lay Down Arms, whose filter counts the Plains its controller controls", () => {
    // Fuzzer seed 14 (batch 215): the options came from the spell's full
    // source and the answer was judged without its `amount` reader, so every
    // offered creature was refused.
    const game = setUp();
    for (let i = 0; i < 2; i += 1) game.debugSpawn("Plains", A, "battlefield", { tapped: false });
    const first = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const second = game.debugSpawn("Grizzly Bears", B, "battlefield");
    game.debugSpawn("Grizzly Bears", A, "battlefield");
    const arms = castBy(game, A, "Lay Down Arms", [objectRef(first)]);
    passTo(game, B);
    castBy(game, B, "Misdirection", [objectRef(arms)]);
    resolveTop(game);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    expect(awaiting.options[0]).toContainEqual(objectRef(second));
    game.dispatch({ type: "choose-targets", player: B, targets: [objectRef(second)] });
    expect(targetsOf(game, arms)).toEqual([objectRef(second)]);
  });
});
