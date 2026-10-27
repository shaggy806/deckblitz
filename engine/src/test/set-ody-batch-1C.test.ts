/**
 * Odyssey (ODY; B225), group C. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  graveyard,
  hand,
  lands,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Atogatog", () => {
  it("sacrificing another Atog pumps it by that Atog's power", () => {
    const { game } = table();
    const atogatog = spawn(game, "Atogatog");
    const psychatog = spawn(game, "Psychatog");
    game.dispatch({ type: "activate-ability", player: A, source: atogatog, abilityIndex: 0, targets: [], sacrifice: psychatog });
    settle(game);
    expect(zone(game, psychatog)).toBe("graveyard");
    expect(pt(game, atogatog)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Psychatog", () => {
  it("exiles two graveyard cards for +1/+1", () => {
    const { game } = table();
    const tog = spawn(game, "Psychatog");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    activate(game, tog, 1);
    expect(graveyard(game)).toHaveLength(0);
    expect(pt(game, tog)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Gravestorm", () => {
  it("an opponent with an empty graveyard can't exile, so you may draw", () => {
    const { game, a } = table();
    spawn(game, "Gravestorm");
    pickTargets(a, B);
    pickModes(a, 0);
    nextTurn(game);
    const before = hand(game).length;
    toStep(game, "draw");
    expect(hand(game).length).toBe(before + 2);
  });

  it("an opponent who exiles a card from their graveyard stops the draw", () => {
    const { game, a, b } = table();
    spawn(game, "Gravestorm");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, B);
    pickModes(a, 0);
    pickModes(b, 0);
    nextTurn(game);
    const before = hand(game).length;
    toStep(game, "draw");
    expect(zone(game, card)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Battle of Wits", () => {
  it("wins at your upkeep with 200 cards in your library, not with fewer", () => {
    const { game } = table();
    spawn(game, "Battle of Wits");
    const library = (): number => game.state.zones.perPlayer[A].library.length;
    // 199 at alice's next upkeep: no draw of hers comes before it.
    for (let i = library(); i < 199; i++) toLibrary(game, "Wastes");
    nextTurn(game);
    nextTurn(game, "draw");
    expect(game.state.result?.over ?? false).toBe(false);
    // 198 after that draw: two more make 200 at the next upkeep.
    for (let i = 0; i < 2; i++) toLibrary(game, "Wastes");
    nextTurn(game);
    nextTurn(game, "draw");
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });
});

describe("Magnivore", () => {
  it("counts sorcery cards in every graveyard", () => {
    const { game } = table();
    const vore = spawn(game, "Magnivore");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Divination", B);
    toGraveyard(game, "Grizzly Bears", B);
    expect(pt(game, vore)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Ivy Elemental", () => {
  it("enters with X +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const ivy = toHand(game, "Ivy Elemental");
    cast(game, ivy, { x: 3 });
    expect(pt(game, ivy)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Infected Vermin", () => {
  it("its 3-damage ability needs threshold", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const vermin = spawn(game, "Infected Vermin");
    expect(() => activate(game, vermin, 1)).toThrow();
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, vermin, 1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(17);
    expect(game.state.players[A].life).toBe(17);
  });
});

describe("Skyshooter", () => {
  it("destroys an attacking creature with flying, but not one outside combat", () => {
    const { game, a } = table();
    const shooter = spawn(game, "Skyshooter");
    const drake = spawn(game, "Wind Drake");
    expect(() => activate(game, shooter, 0, { targets: [ref(drake)] })).toThrow();
    a.declareAttackersFn = () => [{ attacker: drake, defender: B }];
    toStep(game, "declare-blockers");
    activate(game, shooter, 0, { targets: [ref(drake)] });
    expect(zone(game, drake)).toBe("graveyard");
  });
});

describe("Soulcatcher", () => {
  it("grows when a creature with flying dies, not a creature without", () => {
    const { game } = table();
    const catcher = spawn(game, "Soulcatcher");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(pt(game, catcher)).toEqual({ power: 1, toughness: 1 });
    destroy(game, spawn(game, "Wind Drake", B));
    expect(pt(game, catcher)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Darkwater Egg", () => {
  it("uses the stack: adds {U}{B} and draws as it resolves", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const egg = spawn(game, "Darkwater Egg");
    const before = hand(game).length;
    activate(game, egg, 0);
    expect(zone(game, egg)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Battle Strain", () => {
  it("deals 1 damage to a blocking creature's controller", () => {
    const { game, a, b } = table();
    spawn(game, "Battle Strain");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(game.state.players[B].life).toBe(19);
  });
});
