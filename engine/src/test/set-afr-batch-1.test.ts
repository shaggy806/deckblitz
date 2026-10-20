/**
 * Adventures in the Forgotten Realms and its Commander set, the lead's cards (batch 109): the
 * venture cards the three Forgotten Realms dungeons unblocked — Acererak the Archlich, Sefris of
 * the Hidden Ways, Nadaar, Selfless Paladin, Radiant Solar, Zalto, Fire Giant Duke, Dungeon
 * Descent and Thorough Investigation.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";

import {
  A,
  B,
  activate,
  attack,
  enter,
  hand,
  life,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const ventures = (game: Game, player = A): number =>
  game.state.eventLog.filter((e) => e.type === "ventured" && e.player === player).length;

/** Enter Lost Mine of Phandelver whenever asked, and take the first room at a fork. */
const intoLostMine = (seat: ScriptedController): void => {
  seat.chooseVentureFn = (_view, offer) =>
    offer.dungeons !== undefined ? { dungeon: "Lost Mine of Phandelver" } : { room: offer.rooms![0]! };
};

describe("Acererak the Archlich", () => {
  it("enters, returns to its owner's hand and ventures — unless Tomb of Annihilation is completed", () => {
    const { game, a } = table();
    intoLostMine(a);
    const acererak = enter(game, "Acererak the Archlich");
    expect(zone(game, acererak)).toBe("hand");
    expect(ventures(game)).toBe(1);
    game.state.players[A].completedDungeons = ["Tomb of Annihilation"];
    const again = enter(game, "Acererak the Archlich");
    expect(zone(game, again)).toBe("battlefield");
    expect(ventures(game)).toBe(1);
  });

  it("attacking: each opponent who doesn't sacrifice a creature gives you a Zombie", () => {
    const { game, a, b, c } = table({ players: 3 });
    const acererak = spawn(game, "Acererak the Archlich");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", "carol" as typeof B);
    b.chooseModesFn = () => [0];
    c.chooseModesFn = () => [];
    attack(game, a, [acererak], B);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Sefris of the Hidden Ways", () => {
  it("a creature card put into your graveyard from anywhere ventures, once each turn", () => {
    const { game, a } = table();
    intoLostMine(a);
    spawn(game, "Sefris of the Hidden Ways");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(ventures(game)).toBe(1);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(ventures(game)).toBe(1);
  });

  it("doesn't trigger as it dies beside other creatures (its ruling)", () => {
    const { game } = table();
    spawn(game, "Sefris of the Hidden Ways");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } });
    settle(game);
    expect(ventures(game)).toBe(0);
  });

  it("Create Undead: completing a dungeon returns a creature card from your graveyard", () => {
    const { game, a } = table();
    intoLostMine(a);
    spawn(game, "Sefris of the Hidden Ways");
    const wurm = game.debugSpawn("Craw Wurm", A, "graveyard");
    for (let i = 0; i < 4; i += 1) {
      game.debugApplyEffect(A, { kind: "venture" });
      settle(game);
    }
    expect(game.state.players[A].completedDungeons).toEqual(["Lost Mine of Phandelver"]);
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("Nadaar, Selfless Paladin", () => {
  it("ventures as it enters; other creatures get +1/+1 once you've completed a dungeon", () => {
    const { game, a } = table();
    intoLostMine(a);
    const bears = spawn(game, "Grizzly Bears");
    const nadaar = enter(game, "Nadaar, Selfless Paladin");
    expect(ventures(game)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    game.state.players[A].completedDungeons = ["Lost Mine of Phandelver"];
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, nadaar)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Radiant Solar", () => {
  it("ventures for itself and for another nontoken creature, not for a token", () => {
    const { game, a } = table();
    intoLostMine(a);
    enter(game, "Radiant Solar");
    expect(ventures(game)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(ventures(game)).toBe(2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Zombie Token", count: 1 });
    settle(game);
    expect(ventures(game)).toBe(2);
  });

  it("{W}, discard it: venture and gain 3 life", () => {
    const { game, a } = table();
    intoLostMine(a);
    spawn(game, "Plains");
    const solar = toHand(game, "Radiant Solar");
    activate(game, solar);
    expect(zone(game, solar)).toBe("graveyard");
    expect(ventures(game)).toBe(1);
    expect(life(game, A)).toBe(23);
  });
});

describe("Zalto, Fire Giant Duke", () => {
  it("ventures whenever it's dealt damage", () => {
    const { game, a } = table();
    intoLostMine(a);
    const zalto = spawn(game, "Zalto, Fire Giant Duke");
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [{ kind: "object", object: zalto }]);
    settle(game);
    expect(ventures(game)).toBe(1);
  });
});

describe("Dungeon Descent", () => {
  it("{4}, {T}, tap an untapped legendary creature: venture, as a sorcery", () => {
    const { game, a } = table();
    intoLostMine(a);
    const descent = spawn(game, "Dungeon Descent");
    game.state.objects[descent].tapped = false;
    const nadaar = spawn(game, "Nadaar, Selfless Paladin");
    for (let i = 0; i < 4; i += 1) spawn(game, "Wastes");
    activate(game, descent, 1);
    expect(game.state.objects[nadaar].tapped).toBe(true);
    expect(ventures(game)).toBe(1);
  });
});

describe("Thorough Investigation", () => {
  it("attacking investigates; sacrificing a Clue ventures", () => {
    const { game, a } = table();
    intoLostMine(a);
    spawn(game, "Thorough Investigation");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], B);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    for (let i = 0; i < 2; i += 1) spawn(game, "Wastes");
    const [clue] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Clue Token");
    const before = hand(game, A).length;
    activate(game, clue!);
    expect(hand(game, A)).toHaveLength(before + 1);
    expect(ventures(game)).toBe(1);
  });
});
