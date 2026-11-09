/** Cards freed by the need-key themes and the last engine gaps (B293). */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, activate, attack, cast, destroy, hand, lands, life, pickTargets, ref, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const pool = (game: Game): readonly string[] => game.state.players[A].manaPool.map((unit) => unit.type);

describe("a mana ability with a discard cost, on the real cards", () => {
  it("Bog Witch: {B}, {T}, discard a card makes {B}{B}{B}", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const witch = spawn(game, "Bog Witch");
    const first = toHand(game, "Grizzly Bears");
    toHand(game, "Forest");
    activate(game, witch, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("discard");
    game.dispatch({ type: "discard", player: A, cards: [first] });
    expect(zone(game, first)).toBe("graveyard");
    expect(game.state.objects[witch].tapped).toBe(true);
    expect(pool(game)).toEqual(["B", "B", "B"]);
  });

  it("Skirge Familiar: discard a card makes {B}, with no tap", () => {
    const { game } = table();
    const familiar = spawn(game, "Skirge Familiar");
    const first = toHand(game, "Grizzly Bears");
    toHand(game, "Forest");
    activate(game, familiar, 0, { settle: false });
    game.dispatch({ type: "discard", player: A, cards: [first] });
    expect(pool(game)).toEqual(["B"]);
    expect(game.state.objects[familiar].tapped).toBe(false);
  });
});

describe("Xira, the Golden Sting: the delayed if reads the creature as it last existed (603.4, 603.10a)", () => {
  function eggOnBears() {
    const { game, a } = table();
    const xira = spawn(game, "Xira, the Golden Sting");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [xira]);
    settle(game);
    return { game, bears };
  }

  it("with its egg counter on it as it dies: a card and an Insect", () => {
    const { game, bears } = eggOnBears();
    expect(game.state.objects[bears].counters).toMatchObject({ egg: 1 });
    const before = hand(game, A).length;
    destroy(game, bears);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 1);
    expect(tokensNamed(game, "Insect Token (Black, Flying)", A)).toBe(1);
  });

  it("with the counter gone by then: nothing, and the ability is used up", () => {
    const { game, bears } = eggOnBears();
    game.state.objects[bears].counters = {};
    const before = hand(game, A).length;
    destroy(game, bears);
    settle(game);
    expect(hand(game, A).length).toBe(before);
    expect(tokensNamed(game, "Insect Token (Black, Flying)", A)).toBe(0);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });
});

describe("Duskmantle Guildmage: that player is the graveyard's owner", () => {
  it("a creature an opponent owns and you've stolen costs them the life, not you", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    const mage = spawn(game, "Duskmantle Guildmage");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, mage, 0);
    cast(game, toHand(game, "Act of Treason"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].controller).toBe(A);
    destroy(game, bears);
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});
